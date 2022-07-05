import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from 'nestjs-typegoose'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { GenreModel } from './genre.model'
import { CreateGenreDto } from './dto/create-genre.dto'
import { MovieService } from '../movie/movie.service'
import { IGenre } from './genre.interface'

@Injectable()
export class GenreService {

  constructor(@InjectModel(GenreModel) private readonly genreModel: ModelType<GenreModel>,
              private readonly movieService: MovieService) {
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
    const genre = await this.genreModel.findOne({ slug }).exec()

    if (!genre) throw new NotFoundException('GenreЁ not found')

    return genre
  }

  async getCollections() {
    const genres = await this.getAllGenres()

    const collections = await Promise.all(genres.map(async genre => {
      const moviesByGenre = await this.movieService.byGenres([genre._id])

      const result: IGenre = {
        _id: String(genre._id),
        image: moviesByGenre[0].bigPoster,
        slug: genre.slug,
        title: genre.name,
      }

      return result
    }))

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
