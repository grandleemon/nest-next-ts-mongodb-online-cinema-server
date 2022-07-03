import { Injectable } from '@nestjs/common'
import { InjectModel } from 'nestjs-typegoose'
import { RatingModel } from './rating.model'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { MovieService } from '../movie/movie.service'
import { Types } from 'mongoose'
import { SetRatingDto } from './dto/set-rating.dto'

@Injectable()
export class RatingService {
  constructor(@InjectModel(RatingModel) private readonly ratingModel: ModelType<RatingModel>, private readonly movieService: MovieService) {
  }

  async getMovieValueByUser(userId: Types.ObjectId, movieId: Types.ObjectId) {
    return this.ratingModel.findOne({ movieId, userId }).select('value').exec().then(data => data ? data.value : 0)
  }

  async averageRatingByMovie(movieId: Types.ObjectId | string) {
    const ratingsMovie: RatingModel[] = await this.ratingModel.aggregate()
      .match({
        movieId: new Types.ObjectId(movieId),
      }).exec()

    return ratingsMovie.reduce((acc, item) => acc + item.value, 0) / ratingsMovie.length
  }

  async setRating(userId: Types.ObjectId, dto: SetRatingDto) {
    const { movieId, value } = dto
    console.log(dto)

    const newRating = await this.ratingModel.findOneAndUpdate({ movieId, userId }, {
      movieId, userId, value,
    }, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }).exec()

    const averageRating = await this.averageRatingByMovie(movieId)

    await this.movieService.updateRating(movieId, averageRating)

    return newRating
  }

}
