import { CreateProductDto } from '@/products/dtos/create-product.dto';
import { ProductsService } from '@/products/products.service';
import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // @UseGuards(RoleGuard)
  // @Roles(UserRole.ADMIN)
  @UseInterceptors(FilesInterceptor('image', 5))
  @Post('')
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createProductDto: CreateProductDto
  ) {
    const product = await this.productsService.create(createProductDto, files);
    return { message: 'Create Product successfully', data: product };
  }
}
