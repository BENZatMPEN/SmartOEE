import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { OeeService } from './oee.service';
import { CreateOeeDto } from './dto/create-oee.dto';
import { FilterOeeDto } from './dto/filter-oee.dto';
import { UpdateOeeDto } from './dto/update-oee.dto';
import { OeeEntity } from '../common/entities/oee.entity';
import { ProductEntity } from '../common/entities/product.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MachineEntity } from '../common/entities/machine.entity';
import { OeeBatchEntity } from '../common/entities/oee-batch.entity';
import { OeeStatus } from '../common/type/oee-status';
import { OptionItem } from '../common/type/option-item';
import { FileSavePipe } from '../common/pipe/file-save.pipe';
import { PlanningEntity } from '../common/entities/planning.entity';
import { OEE_TYPE_STANDALONE } from '../common/constant';

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('api/oees')
export class OeeController {
  constructor(private readonly oeeService: OeeService) {}

  readonly oeeCodeExistsMessage = 'Oee Code already exists';
  readonly tooManyMachineMessage = 'OEE Standalone cannot have more than one machine';

  @Get()
  findPagedList(@Query() filterDto: FilterOeeDto): Promise<PagedLisDto<OeeEntity>> {
    return this.oeeService.findPagedList(filterDto);
  }

  @Get('options')
  findAllOee(@Query('siteId') siteId: number): Promise<OptionItem[]> {
    return this.oeeService.findOptions(siteId);
  }

  @Get('status')
  findAllStatus(@Query('siteId') siteId: number): Promise<OeeStatus> {
    return this.oeeService.findAllStatus(siteId);
  }

  @Get('all')
  findAll(@Query('siteId') siteId: number): Promise<OeeEntity[]> {
    return this.oeeService.findAll(siteId);
  }

  @Get(':id')
  findById(@Param('id') id: number, @Query('siteId') siteId: number): Promise<OeeEntity> {
    return this.oeeService.findByIdIncludingDetails(id, siteId);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createDto: CreateOeeDto,
    @UploadedFile(FileSavePipe) image: string,
    @Query('siteId') siteId: number,
  ): Promise<OeeEntity> {
    const existingOee = await this.oeeService.findByOeeCode(createDto.oeeCode, siteId);
    if (existingOee) {
      throw new BadRequestException([this.oeeCodeExistsMessage]);
    }

    if (createDto.oeeType === OEE_TYPE_STANDALONE && createDto.oeeMachines.length > 1) {
      throw new BadRequestException([this.tooManyMachineMessage]);
    }

    return this.oeeService.create(createDto, image, siteId);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: number,
    @Body() updateDto: UpdateOeeDto,
    @UploadedFile(FileSavePipe) image: string,
    @Query('siteId') siteId: number,
  ): Promise<OeeEntity> {
    const existingOee = await this.oeeService.findByOeeCode(updateDto.oeeCode, siteId);
    if (existingOee && existingOee.id !== id) {
      throw new BadRequestException([this.oeeCodeExistsMessage]);
    }

    if (updateDto.oeeType === OEE_TYPE_STANDALONE && updateDto.oeeMachines.length > 1) {
      throw new BadRequestException([this.tooManyMachineMessage]);
    }

    return this.oeeService.update(id, updateDto, image, siteId);
  }

  @Delete(':id')
  async delete(@Param('id') id: number, @Query('siteId') siteId: number): Promise<void> {
    await this.oeeService.delete(id, siteId);
  }

  @Delete()
  async deleteMany(
    @Query('ids', new ParseArrayPipe({ items: Number })) ids: number[],
    @Query('siteId') siteId: number,
  ): Promise<void> {
    await this.oeeService.deleteMany(ids, siteId);
  }

  @Get(':id/products')
  async findProductsById(@Param('id') id: number): Promise<ProductEntity[]> {
    const oeeProducts = await this.oeeService.findByIdIncludingProducts(id);
    return oeeProducts.map((oeeProduct) => oeeProduct.product);
  }

  @Get(':id/machines')
  async findMachinesById(@Param('id') id: number): Promise<MachineEntity[]> {
    const oeeMachines = await this.oeeService.findByIdIncludingMachines(id);
    return oeeMachines.map((oeeMachine) => oeeMachine.machine);
  }

  @Get(':id/plannings')
  findByOee(@Param('id') id: number, @Query('siteId') siteId: number): Promise<PlanningEntity[]> {
    return this.oeeService.findPlanningsById(id, siteId);
  }

  @Get(':id/latest-batch')
  async findLatestBatchById(@Param('id') id: number, @Query('siteId') siteId: number): Promise<OeeBatchEntity> {
    return this.oeeService.findLatestBatch(id, siteId);
  }
}
