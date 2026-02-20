import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Req,
  Patch,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Query,
  UseFilters,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { SignupDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { Public } from './auth.guard';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { LanguageService } from '../common/services/language.service';
import { FileValidationFilter } from '../common/filters/file-validation.filter';

/**
 * MIME type regex for allowed document uploads.
 * FileTypeValidator matches against MIME types (e.g. application/msword for .doc), not extensions.
 */
const ALLOWED_DOCUMENT_MIME_TYPE =
  /^(application\/pdf|image\/(jpeg|jpg|png|gif)|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|application\/vnd\.ms-excel|application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|application\/vnd\.ms-powerpoint|application\/vnd\.openxmlformats-officedocument\.presentationml\.presentation)$/;

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly languageService: LanguageService,
  ) {}

  @Public()
  @Post('signup')
  @UseInterceptors(FileInterceptor('document'))
  @UseFilters(FileValidationFilter)
  async signUp(
    @Body() signupDto: SignupDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({
            fileType: ALLOWED_DOCUMENT_MIME_TYPE,
            fallbackToMimetype: true,
          }),
        ],
        fileIsRequired: true,
      }),
    )
    document: Express.Multer.File,
    @Query('lang') lang?: string,
  ) {
    const language = this.languageService.validateLanguage(lang);
    const result = await this.authService.signup(signupDto, document, language);

    const transformedUser =
      this.languageService.transformNestedObjectForLanguage(
        result.user as Record<string, any>,
        language,
        {
          userHOAs: ['hoa'],
          postedJobs: ['services', 'hoa', 'bids'],
        },
      );

    return {
      ...result,
      user: transformedUser,
    };
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Query('lang') lang?: string) {
    const language = this.languageService.validateLanguage(lang);
    const result = await this.authService.login(loginDto, language);

    // Transform the user object with proper handling of HOA fields
    const transformedUser =
      this.languageService.transformNestedObjectForLanguage(
        result.user,
        language,
        {
          userHOAs: ['hoa'],
          postedJobs: ['services', 'hoa', 'bids'],
        },
      );

    return {
      ...result,
      user: transformedUser,
    };
  }

  @Patch('change-password')
  async changePassword(
    @Req() req: Request,
    @Body() dto: ChangePasswordDto,
    @Query('lang') lang?: string,
  ) {
    const user = req['user'];
    const language = this.languageService.validateLanguage(lang);
    return this.authService.changePassword(user.id, dto, language);
  }

  @Get('details')
  async details(@Req() req: Request, @Query('lang') lang?: string) {
    const nationalId = req['user'].nationalId;
    const language = this.languageService.validateLanguage(lang);
    const result = await this.authService.details(nationalId, language);

    const transformedUser =
      this.languageService.transformNestedObjectForLanguage(
        result.user,
        language,
        {
          userHOAs: ['hoa'],
          postedJobs: ['services', 'hoa', 'bids'],
        },
      );

    return {
      user: transformedUser,
    };
  }
}
