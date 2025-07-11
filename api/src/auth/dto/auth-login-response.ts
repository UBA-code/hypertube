import { ApiProperty } from '@nestjs/swagger';
import { userInfoDto } from 'src/users/dto/user-info.dto';

export default class AuthLoginResponseDto {
  @ApiProperty()
  user: userInfoDto;
}
