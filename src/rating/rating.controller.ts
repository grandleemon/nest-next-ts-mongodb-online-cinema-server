import { Body, Controller, Get, HttpCode, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common'
import { RatingService } from './rating.service'
import { Auth } from '../auth/decorators/auth.decorator'
import { Types } from 'mongoose'
import { SetRatingDto } from './dto/set-rating.dto'
import { User } from '../user/decorators/user.decorator'
import { IdValidationPipe } from '../pipes/id.validation.pipe'

@Controller('ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {
  }

  @Get(':movieId')
  @Auth()
  async getMovieValueByUser(@Param('movieId') movieId: Types.ObjectId, @User('_id', IdValidationPipe) _id: Types.ObjectId) {
    return this.ratingService.getMovieValueByUser(_id, movieId)
  }

  @UsePipes(new ValidationPipe())
  @Post('set-rating')
  @HttpCode(200)
  @Auth()
  async setRating(@User('_id', IdValidationPipe) _id: Types.ObjectId, @Body() dto: SetRatingDto) {
    return this.ratingService.setRating(_id, dto)
  }
}
