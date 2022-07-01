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
import { ActorService } from './actor.service'
import { Auth } from '../auth/decorators/auth.decorator'
import { IdValidationPipe } from '../pipes/id.validation.pipe'
import { ActorDto } from './actor.dto'

@Controller('actors')
export class ActorController {
  constructor(private readonly actorService: ActorService) {
  }

  @Get('by-slug/:slug')
  async bySlug(@Param('slug') slug: string) {
    return this.actorService.bySlug(slug)
  }

  @Get()
  async getAll(@Query('searchTerm') searchTerm?: string) {
    return this.actorService.getAll(searchTerm)
  }

  @Get(':id')
  @Auth('admin')
  async get(@Param('id', IdValidationPipe) id: string) {
    return this.actorService.byId(id)
  }

  @UsePipes(new ValidationPipe())
  @Post()
  @HttpCode(200)
  @Auth('admin')
  async create() {
    return this.actorService.create()
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Auth('admin')
  @Put(':id')
  async update(@Param('id', IdValidationPipe) id: string, @Body() dto: ActorDto) {
    return this.actorService.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(200)
  @Auth('admin')
  async delete(@Param('id', IdValidationPipe) id: string) {
    return this.actorService.delete(id)
  }

}
