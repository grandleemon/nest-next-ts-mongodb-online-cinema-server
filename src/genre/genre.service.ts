import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from 'nestjs-typegoose'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { GenreModel } from './genre.model'
import { CreateGenreDto } from './dto/create-genre.dto'

@Injectable()
export class GenreService {

  constructor(@InjectModel(GenreModel) private readonly genreModel: ModelType<GenreModel>) {
  }

  async getAllGenres(searchTerm?: string) {
    let options = {}

    if (searchTerm) {
      options = {
        $or: [
          {
            name: new RegExp(searchTerm, 'i'),
          },
          {
            slug: new RegExp(searchTerm, 'i'),
          },
          {
            description: new RegExp(searchTerm, 'i'),
          },
        ],
      }
    }

    return this.genreModel.find(options).select('-updatedAt -__v').sort({ createdAt: 'desc' }).exec()
  }

  async bySlug(slug: string) {
    return this.genreModel.findOne({ slug }).exec()
  }

  async getCollections() {
    const genres = await this.getAllGenres()

    const collections = genres

    return collections
  }

  /* ADMIN */

  async create() {
    const defaultValue: CreateGenreDto = {
      description: '',
      name: '',
      slug: '',
      icon: '',
    }

    const genre = await this.genreModel.create(defaultValue)

    return genre._id
  }

  async byId(_id: string) {
    const genre = await this.genreModel.findById(_id)
    if (!genre) throw new NotFoundException('Genre not found')

    return genre
  }

  async update(_id: string, dto: CreateGenreDto) {
    const updateGenre = this.genreModel.findByIdAndUpdate(_id, dto, {
      new: true,
    }).exec()

    if (!updateGenre) throw new NotFoundException('Genre not found')

    return updateGenre
  }

  async delete(_id) {
    const deleteGenre = this.genreModel.findByIdAndDelete(_id).exec()

    if (!deleteGenre) throw new NotFoundException('Genre not found')

    return deleteGenre
  }
}
