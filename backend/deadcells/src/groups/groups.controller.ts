import { Controller, Get, Post, Body, UseGuards, Req, Param, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  findAll() {
    return this.groupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() createGroupDto: CreateGroupDto, @Req() req: any) {
    const ownerId = req.user.id;
    const group = await this.groupsService.create(createGroupDto, ownerId);
    return {
      message: 'Tạo nhóm thành công, đang chờ phê duyệt.',
      data: group,
    };
  }
}