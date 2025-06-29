import { PrismaService } from '@/database/prisma.service';
import { CreateProductDto } from '@/products/dtos/create-product.dto';
import { CloudinaryService } from '@/upload/cloudinary.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from 'prisma/generated/prisma';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  async create(
    createProductDto: CreateProductDto,
    files: Express.Multer.File[]
  ) {
    // wrap in prisma transaction
    return this.prismaService.$transaction(async (tx) => {
      // insert new product to product table, upload image to cloudinary
      const [product, uploadResult] = await Promise.all([
        tx.product.create({ data: createProductDto }),
        this.cloudinaryService.uploadMultipleFile(files)
      ]);
      // insert product image url to product image table
      const data:
        | Prisma.ProductImageCreateManyInput
        | Prisma.ProductImageCreateManyInput[] = uploadResult.map(
        (result, idx) => ({
          productId: product.id,
          imageUrl: result.secure_url,
          isMain: idx === 0
        })
      );
      await tx.productImage.createMany({ data });

      // return new product include image
      return tx.product.findUnique({
        where: { id: product.id },
        include: { productImages: true }
      });
    });
  }
}
