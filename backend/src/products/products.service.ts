import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Products } from './entities/product.entity';
import { Users } from '../users/entities/user.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Products, 'testConection')
    private readonly productRepository: Repository<Products>,
    @InjectRepository(Users, 'testConection')
    private readonly userRepository: Repository<Users>
  ) {}

  async create(createProductDto: CreateProductDto, userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const product = this.productRepository.create({
      ...createProductDto,
      createdBy: user
    });

    return await this.productRepository.save(product);
  }

  async findAll() {
    return await this.productRepository.find({ relations: ['createdBy', 'updatedBy'] });
  }

  async findOne(id: string) {
    return await this.productRepository.findOne({
      where: { id },
      relations: ['createdBy', 'updatedBy']
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto, userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const product = await this.productRepository.preload({
      id,
      ...updateProductDto,
      updatedBy: user
    });

    if (!product) throw new Error('Product not found');

    return await this.productRepository.save(product);
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    if (!product) throw new Error('Product not found');
    return await this.productRepository.remove(product);
  }
}