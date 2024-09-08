import { In, Repository } from 'typeorm';
import {
  CreateOptionInput,
  authCode,
  authCredentials,
} from './optionDto/optionInput';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Option } from 'src/graphql/models/options';
import { google } from 'googleapis';
import * as fs from 'fs';
import { Optionkeys } from './optionDto/option_keys';
import { ConfigService } from '@nestjs/config';
import { deleteFileAsync } from 'src/shared/removeFile';

@Injectable()
export class OptionService {
  private oAuth2Client: any;
  constructor(
    @InjectRepository(Option)
    private optionRepository: Repository<Option>,
    private readonly configService: ConfigService,
  ) {}

  async getOptions() {
    return await this.optionRepository.find();
  }

  async createOption(
    createOptionData: CreateOptionInput,
  ): Promise<CreateOptionInput> {
    const option = await this.findOptionByOptionKey(
      createOptionData?.option_key,
    );
    if (option) {
      throw new BadRequestException('Option already registered');
    }
    return this.optionRepository.save(createOptionData);
  }

  async updateOption(updateOptionData: CreateOptionInput) {
    const OptionToUpdate = await this.findOptionByOptionKey(
      updateOptionData?.option_key,
    );
    if (!OptionToUpdate) {
      throw new BadRequestException('Please enter valid option_key');
    } else {
      if (
        OptionToUpdate?.option_value?.org_logo &&
        OptionToUpdate?.option_value?.org_favicon
      ) {
        await deleteFileAsync(OptionToUpdate?.option_value?.org_logo);
        await deleteFileAsync(OptionToUpdate?.option_value?.org_favicon);
      }
      OptionToUpdate.option_value = updateOptionData.option_value;
      return await this.optionRepository.save(OptionToUpdate);
    }
  }

  //find option by option_key
  async findOptionByOptionKey(option_key: string) {
    const Option = await this.optionRepository.findOne({
      where: { option_key },
    });
    return Option;
  }

  //get option by option_keys passss multiplr option keys in array
  async getOptionsByOptionKeys(option_keys: string[]) {
    return await this.optionRepository.find({
      where: {
        option_key: In(option_keys),
      },
    });
  }

  // Save Google auth credentials and generate auth URL
  async saveAuthCredentials(authCredentials: authCredentials) {
    const auth_url = this.generateAuthUrl(
      authCredentials.client_id,
      authCredentials.client_secret,
      authCredentials.redirect_uris,
      this.configService.get<string>('google_calender_scope'),
    );
    const optionKey = Optionkeys.AUTH_CREDENTIALS;
    const option = await this.findOptionByOptionKey(optionKey);
    if (option) {
      option.option_value = authCredentials;
      await this.optionRepository.save(option);
    } else {
      const newOption = this.optionRepository.create({
        option_key: optionKey,
        option_value: authCredentials,
      });
      await this.optionRepository.save(newOption);
    }
    return auth_url;
  }

  // Generate authorization URL
  async generateAuthUrl(
    client_id: string,
    client_secret: string,
    redirect_uri: string,
    scopes: string,
  ) {
    this.oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uri,
    );
    const authUrl = this.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
    return authUrl;
  }

  // Initialize OAuth2 client
  async initOAuth2Client() {
    const auth_credentials = await this.findOptionByOptionKey(
      Optionkeys.AUTH_CREDENTIALS,
    );
    this.oAuth2Client = new google.auth.OAuth2(
      auth_credentials?.option_value?.client_id,
      auth_credentials?.option_value?.client_secret,
      auth_credentials?.option_value?.redirect_uris,
    );
    return this.oAuth2Client;
  }

  // Save authorization code and exchange it for tokens
  async saveAuthCode(authCode: authCode) {
    if (!this.oAuth2Client) {
      await this.initOAuth2Client();
    }
    try {
      const decodedAuthCode = decodeURIComponent(authCode.code);
      const { tokens } = await this.oAuth2Client.getToken(decodedAuthCode);
      this.oAuth2Client.setCredentials(tokens);
      fs.writeFileSync('token.json', JSON.stringify(tokens));
      //save auth code for generate tokens
      const auth_code = await this.findOptionByOptionKey(Optionkeys?.AUTH_CODE);
      auth_code.option_value = {
        ...auth_code.option_value,
        code: decodedAuthCode,
      };
      await this.optionRepository.save(auth_code);
      //update meeting_config to connect which platform like google or zoom
      const option = await this.findOptionByOptionKey(
        Optionkeys?.MEETING_CONFIG,
      );
      option.option_value = {
        ...option.option_value,
        google_meet: true,
      };
      await this.optionRepository.save(option);
      return {
        success: true,
        message: 'Google meet connected successfully',
        status: 200,
      };
    } catch (error) {
      console.error(
        'Error saving auth code:',
        error.response ? error.response.data : error.message,
      );
      throw error;
    }
  }

  //authentication for calender events
  async authenticate() {
    if (!this.oAuth2Client) {
      await this.initOAuth2Client();
    }
    try {
      const token = JSON.parse(fs.readFileSync('token.json', 'utf-8'));
      this.oAuth2Client.setCredentials(token);
      return this.oAuth2Client;
    } catch (err) {
      return err;
    }
  }
}
