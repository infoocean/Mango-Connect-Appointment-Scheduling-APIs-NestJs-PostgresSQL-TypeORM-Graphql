import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/middleware/auth.guard';
import { AuthorizationGuard } from 'src/middleware/auth.middleware';
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  authCode,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  authCredentials,
  CreateOptionInput,
  UpdateLogoFavIconOptionInput,
} from './optionDto/optionInput';
import { OptionService } from './option.services';
import { Option } from 'src/graphql/models/options';
import { commonResponse } from 'src/shared/common_responce';
import { saveFile } from 'src/shared/saveFile';
@Resolver(() => Option)
export class OptionResolver {
  constructor(private optionService: OptionService) {}

  //create Option
  @Mutation(() => Option)
  @UseGuards(AuthorizationGuard, AuthGuard)
  async createOption(
    @Args('createOptionData')
    createOptionData: CreateOptionInput,
  ) {
    return this.optionService.createOption(createOptionData);
  }

  //update  Option
  @Mutation(() => Option)
  @UseGuards(AuthorizationGuard, AuthGuard)
  async updateOption(
    @Args('updateOptionData')
    updateOptionData: CreateOptionInput,
  ) {
    return this.optionService.updateOption(updateOptionData);
  }

  //Upload site logo and favicon images API
  @Mutation(() => String)
  async updateSiteTitleFaviconLogo(
    @Args('siteTitleFaviconLogo')
    siteTitleFaviconLogo: UpdateLogoFavIconOptionInput,
  ) {
    try {
      const [logoUpload, faviconUpload] = await Promise.all([
        siteTitleFaviconLogo?.option_value?.org_logo,
        siteTitleFaviconLogo?.option_value?.org_favicon,
      ]);

      const { createReadStream: logoReadStream, filename: logoFilename } =
        await logoUpload;
      const logoimagePath = await saveFile(logoReadStream, logoFilename);

      const { createReadStream: faviconReadStream, filename: faviconFilename } =
        await faviconUpload;
      const faviconImagePath = await saveFile(
        faviconReadStream,
        faviconFilename,
      );
      // Store filenames in the database
      const updateOptionData: any = {
        option_key: siteTitleFaviconLogo?.option_key,
        option_value: {
          org_title: siteTitleFaviconLogo?.option_value?.org_title,
          org_logo: logoimagePath,
          org_favicon: faviconImagePath,
          company_name: siteTitleFaviconLogo?.option_value?.company_name,
          company_email: siteTitleFaviconLogo?.option_value?.company_email,
          company_phone: siteTitleFaviconLogo?.option_value?.company_phone,
          company_address: siteTitleFaviconLogo?.option_value?.company_address,
        },
      };
      const result = await this.optionService.updateOption(updateOptionData);
      return JSON.stringify(result);
    } catch (error) {
      throw new Error('Failed to upload image. Please try again.');
    }
  }

  //get options
  @Query(() => [Option])
  @UseGuards(AuthorizationGuard, AuthGuard)
  async getOptions() {
    return this.optionService.getOptions();
  }

  //get options by options keys
  @Query(() => [Option])
  @UseGuards(AuthorizationGuard, AuthGuard)
  async getOptionsByOprionkeys(
    @Args('options_keys', { type: () => [String] }) options_keys: string[],
  ) {
    return this.optionService.getOptionsByOptionKeys(options_keys);
  }

  //save  auth credintials
  @Mutation(() => String)
  @UseGuards(AuthorizationGuard, AuthGuard)
  async saveAuthCredentials(
    @Args('authCredentials')
    authCredentials: authCredentials,
  ) {
    return this.optionService.saveAuthCredentials(authCredentials);
  }

  //save auth code
  @Mutation(() => commonResponse)
  @UseGuards(AuthorizationGuard, AuthGuard)
  async saveAuthCode(
    @Args('authCode')
    authCode: authCode,
  ) {
    return this.optionService.saveAuthCode(authCode);
  }
}
