import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { GenreService } from './genre.service'
import { IdValidationPipe } from '../pipes/id.validation.pipe'
import { Auth } from '../auth/decorators/auth.decorator'
import { CreateGenreDto } from './dto/create-genre.dto'

@Controller('genres')
export class GenreController {
  constructor(private readonly genreService: GenreService) {
  }

  @Get('by-slug/:slug')
  async getGenreBySlug(@Param('slug') slug: string) {
    return this.genreService.bySlug(slug)
  }

  @Get('/collections')
  async getCollections() {
    return this.genreService.getCollections()
  }

  @Get()
  async getAll(@Query('searchTerm') searchTerm?: string) {
    return this.genreService.getAllGenres(searchTerm)
  }

  @Get(':id')
  @Auth('admin')
  async getById(@Param('id', IdValidationPipe) id: string) {
    return this.genreService.byId(id)
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post()
  @Auth('admin')
  async create() {
    return this.genreService.create()
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Put(':id')
  @Auth('admin')
  async update(@Param('id', IdValidationPipe) id: string, @Body() dto: CreateGenreDto) {
    return this.genreService.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(200)
  @Auth('admin')
  async delete(@Param('id', IdValidationPipe) id: string) {
    return this.genreService.delete(id)
  }
}
