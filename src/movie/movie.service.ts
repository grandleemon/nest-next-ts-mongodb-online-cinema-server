import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from 'nestjs-typegoose'
import { MovieModel } from './movie.model'
import { DocumentType, ModelType } from '@typegoose/typegoose/lib/types'
import { Types } from 'mongoose'
import { UpdateMovieDto } from './dto/update-movie.dto'
import { TelegramService } from '../telegram/telegram.service'

@Injectable()
export class MovieService {
  constructor(@InjectModel(MovieModel) private readonly movieModel: ModelType<MovieModel>,
              private readonly telegramService: TelegramService) {
  }

  async getAll(searchTerm: string) {
    let options = {}

    if (searchTerm) {
      options = {
        $or: [
          {
            title: new RegExp(searchTerm, 'i'),
          },
        ],
      }
    }

    return this.movieModel.find(options)
      .select('-updatedAt -__v')
      .sort({ createdAt: 'desc' })
      .populate('actors genres')
      .exec()
  }

  async bySlug(slug: string) {
    const movie = await this.movieModel.findOne({ slug }).populate('actors genres').exec()

    if (!movie) throw new NotFoundException('Movie was not found')

    return movie
  }

  async updateRating(id: Types.ObjectId, newRating: number) {
    return this.movieModel.findByIdAndUpdate(id, {
      rating: newRating,
    }, {
      new: true,
    }).exec()
  }

  async byId(id: string) {
    const movie = await this.movieModel.findById(id)

    if (!movie) throw new NotFoundException('Movie was not found')

    return movie
  }

  async byActor(actorId: Types.ObjectId) {
    const actor = await this.movieModel.find({ actors: actorId })
    if (!actor) throw new NotFoundException('Movies were not found')

    return actor
  }

  async byGenres(genresIds: Types.ObjectId[]): Promise<DocumentType<MovieModel>[]> {
    const genres = await this.movieModel.find({ genres: { $in: genresIds } }).exec()
    if (!genres) throw new NotFoundException('Movies were not found')

    return genres
  }

  async getMostPopular() {
    return this.movieModel.find({ countOpened: { $gt: 0 } }).sort({
      countOpened: -1,
    }).populate('genres')
  }

  async updateCountOpened(slug: string) {
    const update = await this.movieModel.findOneAndUpdate({ slug }, {
      $inc: { countOpened: 1 },
    }, { new: true })
    if (!update) throw new NotFoundException('Movie was not found')

    return update
  }

  async create() {
    const defaultValue: UpdateMovieDto = {
      bigPoster: '',
      actors: [],
      genres: [],
      poster: '',
      title: '',
      videoUrl: '',
      slug: '',
    }

    const movie = await this.movieModel.create(defaultValue)
    return movie._id
  }

  async update(id: string, dto: UpdateMovieDto) {
    if (!dto.isSendTelegram) {
      await this.sendNotification(dto)
      dto.isSendTelegram = true
    }
    const updateMovie = await this.movieModel.findByIdAndUpdate(id, dto, {
      bigPoster: dto.bigPoster,
      actors: dto.actors,
      genres: dto.genres,
      poster: dto.poster,
      title: dto.title,
      videoUrl: dto.videoUrl,
      slug: dto.slug,
    })
    if (!updateMovie) throw new NotFoundException('Movie was not found')

    return updateMovie
  }

  async delete(id: string) {
    const movie = await this.movieModel.findByIdAndDelete(id)
    if (!movie) throw new NotFoundException('Movie was not found')

    return movie
  }

  async sendNotification(dto: UpdateMovieDto) {
    // if (process.env.NODE_ENV !== 'development') {

    const msg = `<b>${dto.title}</b>`

    // await this.telegramService.sendPhoto('')

    await this.telegramService.sendMessage(msg, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              url: 'https://okko.tv/serial/westworld',
              text: 'Go to watch',
            },
          ],
        ],
      },
    })
    // }
  }
}


