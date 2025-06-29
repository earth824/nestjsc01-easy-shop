import { envConfig } from '@/config/env.config';
import {
  Inject,
  Injectable,
  InternalServerErrorException
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject(envConfig.KEY)
    private readonly envConfigService: ConfigType<typeof envConfig>
  ) {
    cloudinary.config({
      cloud_name: envConfigService.CLOUDINARY_CLOUD_NAME,
      api_key: envConfigService.CLOUDINARY_API_KEY,
      api_secret: envConfigService.CLOUDINARY_API_SECRET
    });
  }

  uploadFile(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto'
        },
        (error, result) => {
          if (error)
            throw new InternalServerErrorException('Cloudinary upload failed');
          if (!result)
            throw new InternalServerErrorException('Cloudinary result missing');
          resolve(result);
        }
      );

      const bufferStream = new Readable();
      bufferStream.push(file.buffer);
      bufferStream.push(null);
      bufferStream.pipe(uploadStream);
    });
  }

  uploadMultipleFile(
    files: Express.Multer.File[]
  ): Promise<UploadApiResponse[]> {
    return Promise.all(files.map((el) => this.uploadFile(el)));
  }
}
