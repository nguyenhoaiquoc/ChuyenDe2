import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from '../entities/group.entity';
import { GroupMember } from '../entities/group-member.entity';
import { CreateGroupDto } from './dto/create-group.dto';

const LEADER_ROLE_ID = 1;
const INACTIVE_STATUS_ID = 2;

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(GroupMember)
    private readonly groupMemberRepository: Repository<GroupMember>,
  ) {}

  async create(createGroupDto: CreateGroupDto, ownerId: number): Promise<Group> {
    if (!ownerId) {
      throw new UnauthorizedException('Yêu cầu không hợp lệ, không tìm thấy người dùng.');
    }

    if (!createGroupDto.name || createGroupDto.name.trim().length === 0) {
      throw new BadRequestException('Tên nhóm không được để trống.');
    }

    return await this.groupRepository.manager.transaction(async (transactionalEntityManager) => {
      // Tạo nhóm với status_id = 2 (inactive)
      const newGroup = this.groupRepository.create({
        name: createGroupDto.name.trim(),
        owner_id: ownerId,
        status_id: INACTIVE_STATUS_ID,
        count_member: 1,
        
      });

      const savedGroup = await transactionalEntityManager.save(Group, newGroup);

      // Thêm owner làm Leader
      const newMember = this.groupMemberRepository.create({
        group_id: savedGroup.id,
        user_id: ownerId,
        group_role_id: LEADER_ROLE_ID,
      });
      await transactionalEntityManager.save(GroupMember, newMember);

      return savedGroup;
    });
  }

  async findAll(): Promise<Group[]> {
    return this.groupRepository.find({
      where: { status_id: 0 }, // Chỉ trả về nhóm active
      order: { created_at: 'DESC' },
      relations: ['status'],
    });
  }

  async findOne(id: number): Promise<Group> {
    const group = await this.groupRepository.findOne({
      where: { id, status_id: 0 },
      relations: ['status'],
    });
    if (!group) {
      throw new NotFoundException(`Không tìm thấy nhóm với ID ${id} hoặc nhóm chưa được phê duyệt.`);
    }
    return group;
  }
}