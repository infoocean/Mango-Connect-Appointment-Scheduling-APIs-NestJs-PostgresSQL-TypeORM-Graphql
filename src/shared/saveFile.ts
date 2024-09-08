import { join } from 'path';
import { existsSync, mkdirSync, createWriteStream } from 'fs';
import { v4 as uuid } from 'uuid';

function saveFile(
  // eslint-disable-next-line @typescript-eslint/ban-types
  createReadStream: Function,
  filename: string,
): Promise<string> {
  const uploadDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }

  const uniqueFilename = `${uuid()}-${filename}`;
  const filePath = join(uploadDir, uniqueFilename);
  const stream = createReadStream();
  const writeStream = createWriteStream(filePath);

  return new Promise((resolve, reject) => {
    stream.pipe(writeStream);
    writeStream.on('finish', () => resolve(`uploads/${uniqueFilename}`));
    writeStream.on('error', reject);
  });
}

export { saveFile };
