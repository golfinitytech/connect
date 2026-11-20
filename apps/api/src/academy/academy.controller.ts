import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  AcademyAuthGuard,
  AcademyRoles,
  CurrentAcademyUser,
} from './academy-auth.guard';
import type { AcademyPrincipal } from './academy-auth.guard';
import { AcademyService } from './academy.service';
import {
  AcademyLoginDto,
  AssignCoachDto,
  ChangePasswordDto,
  CompleteEvaluationDto,
  CreateAccountDto,
  CreateFeedbackDto,
  CreateSessionDto,
  SendMessageDto,
  UpdateProgressDto,
  UpdateSessionStatusDto,
} from './dto/academy.dto';

@Controller('academy/auth')
export class AcademyAuthController {
  constructor(private readonly academy: AcademyService) {}

  @Post('login')
  login(@Body() dto: AcademyLoginDto) {
    return this.academy.login(dto);
  }

  @Get('me')
  @UseGuards(AcademyAuthGuard)
  me(@CurrentAcademyUser() user: AcademyPrincipal) {
    return this.academy.me(user);
  }

  @Post('password')
  @UseGuards(AcademyAuthGuard)
  changePassword(
    @CurrentAcademyUser() user: AcademyPrincipal,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.academy.changePassword(user, dto.currentPassword, dto.newPassword);
  }
}

@Controller('academy')
@UseGuards(AcademyAuthGuard)
export class AcademyController {
  constructor(private readonly academy: AcademyService) {}

  // Accounts
  @Get('coaches')
  coaches() {
    return this.academy.listCoaches();
  }

  @Get('students')
  @AcademyRoles('COACH', 'ADMIN')
  students(
    @CurrentAcademyUser() user: AcademyPrincipal,
    @Query('search') search?: string,
  ) {
    return this.academy.listStudents(user, search);
  }

  @Post('accounts')
  @AcademyRoles('ADMIN')
  createAccount(@Body() dto: CreateAccountDto) {
    return this.academy.createAccount(dto);
  }

  @Patch('students/:id/coach')
  @AcademyRoles('ADMIN')
  assignCoach(@Param('id') id: string, @Body() dto: AssignCoachDto) {
    return this.academy.assignCoach(id, dto.coachId ?? null);
  }

  @Patch('accounts/:id/active')
  @AcademyRoles('ADMIN')
  setActive(@Param('id') id: string, @Body('active') active: boolean) {
    return this.academy.setAccountStatus(id, active === true);
  }

  // Catalog
  @Get('venues')
  venues() {
    return this.academy.listVenues();
  }

  @Get('programs')
  programs() {
    return this.academy.listPrograms();
  }

  @Get('learning-content')
  learningContent() {
    return this.academy.listLearningContent();
  }

  // Syllabus
  @Get('syllabus')
  async syllabus(
    @CurrentAcademyUser() user: AcademyPrincipal,
    @Query('studentId') studentId?: string,
  ) {
    const id = studentId ?? user.id;
    await this.academy.assertCanViewStudent(user, id);
    return this.academy.syllabusFor(id);
  }

  @Put('progress')
  @AcademyRoles('COACH', 'ADMIN')
  updateProgress(
    @CurrentAcademyUser() user: AcademyPrincipal,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.academy.updateProgress(user, dto);
  }

  // Sessions
  @Get('sessions')
  sessions(
    @CurrentAcademyUser() user: AcademyPrincipal,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('studentId') studentId?: string,
  ) {
    return this.academy.listSessions(user, { from, to, studentId });
  }

  @Post('sessions')
  createSession(
    @CurrentAcademyUser() user: AcademyPrincipal,
    @Body() dto: CreateSessionDto,
  ) {
    return this.academy.createSession(user, dto);
  }

  @Patch('sessions/:id/status')
  updateSessionStatus(
    @CurrentAcademyUser() user: AcademyPrincipal,
    @Param('id') id: string,
    @Body() dto: UpdateSessionStatusDto,
  ) {
    return this.academy.updateSessionStatus(user, id, dto.status);
  }

  // Evaluations
  @Get('evaluations')
  evaluations(
    @CurrentAcademyUser() user: AcademyPrincipal,
    @Query('status') status?: string,
    @Query('studentId') studentId?: string,
  ) {
    return this.academy.listEvaluations(user, { status, studentId });
  }

  @Patch('evaluations/:id')
  @AcademyRoles('COACH', 'ADMIN')
  completeEvaluation(
    @CurrentAcademyUser() user: AcademyPrincipal,
    @Param('id') id: string,
    @Body() dto: CompleteEvaluationDto,
  ) {
    return this.academy.completeEvaluation(user, id, dto);
  }

  // Messages
  @Get('messages/contacts')
  contacts(@CurrentAcademyUser() user: AcademyPrincipal) {
    return this.academy.listContacts(user);
  }

  @Get('messages/:otherId')
  conversation(
    @CurrentAcademyUser() user: AcademyPrincipal,
    @Param('otherId') otherId: string,
  ) {
    return this.academy.conversation(user, otherId);
  }

  @Post('messages/:otherId')
  send(
    @CurrentAcademyUser() user: AcademyPrincipal,
    @Param('otherId') otherId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.academy.sendMessage(user, otherId, dto.text);
  }

  // Feedback
  @Post('feedback')
  @AcademyRoles('STUDENT', 'COACH')
  createFeedback(
    @CurrentAcademyUser() user: AcademyPrincipal,
    @Body() dto: CreateFeedbackDto,
  ) {
    return this.academy.createFeedback(user, dto);
  }

  @Get('feedback')
  @AcademyRoles('ADMIN')
  feedback() {
    return this.academy.listFeedback();
  }

  // Dashboards
  @Get('stats')
  stats(@CurrentAcademyUser() user: AcademyPrincipal) {
    return this.academy.stats(user);
  }

  @Get('reports')
  @AcademyRoles('ADMIN')
  reports() {
    return this.academy.reports();
  }
}
