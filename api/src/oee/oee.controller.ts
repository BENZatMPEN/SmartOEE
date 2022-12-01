import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IdListDto } from '../common/dto/id-list.dto';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { OeeService } from './oee.service';
import { CreateOeeDto } from './dto/create-oee.dto';
import { FilterOeeDto } from './dto/filter-oee.dto';
import { UpdateOeeDto } from './dto/update-oee.dto';
import { Oee } from '../common/entities/oee';
import { Product } from '../common/entities/product';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReqDec } from '../common/decorator/req-dec';
import { SiteIdPipe } from '../common/pipe/site-id-pipe.service';
import { Site } from '../common/entities/site';
import { Machine } from '../common/entities/machine';
import { OeeBatch } from '../common/entities/oee-batch';
import { OeeStatus } from '../common/type/oee-status';
import { OptionItem } from '../common/type/option-item';
// import { SocketService } from '../common/services/socket.service';

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('oees')
export class OeeController {
  constructor(private readonly oeeService: OeeService) {}

  @Get()
  findPagedList(
    @Req() req,
    @Query() filterDto: FilterOeeDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<PagedLisDto<Oee>> {
    return this.oeeService.findPagedList(filterDto);
  }

  @Get('options')
  findAllOee(@ReqDec(SiteIdPipe) siteId: number): Promise<OptionItem[]> {
    return this.oeeService.findOptions(siteId);
  }

  @Get('status')
  findAllStatus(@ReqDec(SiteIdPipe) siteId: number): Promise<OeeStatus> {
    return this.oeeService.findAllStatus(siteId);
  }

  @Get('all')
  findAll(@ReqDec(SiteIdPipe) siteId: number): Promise<Oee[]> {
    return this.oeeService.findAll(siteId);
  }

  @Get(':id')
  async findById(@Param('id') id: number, @ReqDec(SiteIdPipe) siteId: number): Promise<Oee> {
    const oee = await this.oeeService.findByIdIncludingDetails(id, siteId);
    if (!oee) {
      throw new NotFoundException();
    }

    return oee;
  }

  @Post()
  create(
    @Body() createDto: CreateOeeDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<Oee> {
    return this.oeeService.create(createDto);
    // const { oeeProducts, oeeMachines, ...other } = createDto;
    // const dtoOeeProducts = JSON.parse(oeeProducts) as OeeProduct[];
    // const dtoOeeMachines = JSON.parse(oeeMachines) as OeeMachine[];
    // const dto = {
    //   ...other,
    //   oeeProducts: dtoOeeProducts,
    //   oeeMachines: dtoOeeMachines,
    // } as CreateOeeDto;
    // return this.oeeService.create(dto, image);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateDto: UpdateOeeDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<Oee> {
    return this.oeeService.update(id, updateDto);
    // const { oeeProducts, oeeMachines, ...other } = updateDto;
    // const dtoOeeProducts = JSON.parse(oeeProducts) as OeeProduct[];
    // const dtoOeeMachines = JSON.parse(oeeMachines) as OeeMachine[];
    // const dto = {
    //   ...other,
    //   oeeProducts: dtoOeeProducts,
    //   oeeMachines: dtoOeeMachines,
    // } as UpdateOeeDto;
    // return this.oeeService.update(id, dto, image);
  }

  @Post(':id/upload')
  @UseInterceptors(FileInterceptor('image'))
  async upload(
    @Param('id') id: number,
    @UploadedFile() image: Express.Multer.File,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<Oee> {
    return this.oeeService.upload(id, image);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<void> {
    await this.oeeService.delete(id);
  }

  @Delete()
  async deleteMany(
    @Query() dto: IdListDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<void> {
    await this.oeeService.deleteMany(dto.ids);
  }

  @Get(':id/products')
  async findProductsById(
    @Param('id') id: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<Product[]> {
    const oeeProducts = await this.oeeService.findByIdIncludingProducts(id);
    return oeeProducts.map((oeeProduct) => oeeProduct.product);
  }

  @Get(':id/machines')
  async findMachinesById(
    @Param('id') id: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<Machine[]> {
    const oeeMachines = await this.oeeService.findByIdIncludingMachines(id);
    return oeeMachines.map((oeeMachine) => oeeMachine.machine);
  }

  @Get(':id/latest-batch')
  async findLatestBatchById(
    @Param('id') id: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<OeeBatch> {
    return this.oeeService.findLatestBatch(id);
  }
}
