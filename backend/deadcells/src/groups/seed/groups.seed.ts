import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Group } from 'src/entities/group.entity';
import { GroupMember } from 'src/entities/group-member.entity';

@Injectable()
export class GroupSeedService implements OnModuleInit {
  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    const groupRepo = this.dataSource.getRepository(Group);
    const groupMemberRepo = this.dataSource.getRepository(GroupMember);

    const groups = [
      {
        id: 1,
        name: 'Khoa Công nghệ thông tin',
        owner_id: 1,
        mustApprovePosts: true,
        description: 'Nhóm ngành về lập trình, hệ thống và mạng',
        thumbnail_url:
          'https://res.cloudinary.com/drinu8efl/image/upload/v1762967710/products/xdz34orxprxz6y262661.jpg',
        status_id: 1,
        isPublic: true,
      },
      {
        id: 2,
        name: 'Khoa Kinh tế',
        owner_id: 1,
        mustApprovePosts: true,
        description: 'Nhóm ngành về tài chính, kế toán, quản trị',
        thumbnail_url:
          'https://res.cloudinary.com/drinu8efl/image/upload/v1762967710/products/xdz34orxprxz6y262661.jpg',
        status_id: 1,
        isPublic: true,
      },
      {
        id: 3,
        name: 'Khoa Y dược',
        owner_id: 1,
        mustApprovePosts: true,
        description: 'Nhóm ngành về y học, điều dưỡng, dược phẩm',
        thumbnail_url:
          'https://res.cloudinary.com/drinu8efl/image/upload/v1762967710/products/xdz34orxprxz6y262661.jpg',
        status_id: 1,
        isPublic: true,
      },
      {
        id: 4,
        name: 'Khoa Ngôn ngữ Nhật',
        owner_id: 1,
        mustApprovePosts: true,
        description: 'Nhóm ngành về tiếng Nhật',
        thumbnail_url:
          'https://res.cloudinary.com/drinu8efl/image/upload/v1762967710/products/xdz34orxprxz6y262661.jpg',
        status_id: 1,
        isPublic: true,
      },
      {
        id: 5,
        name: 'Khoa Ngôn ngữ Anh',
        owner_id: 1,
        mustApprovePosts: true,
        description: 'Nhóm ngành về tiếng Anh',
        thumbnail_url:
          'https://res.cloudinary.com/drinu8efl/image/upload/v1762967710/products/xdz34orxprxz6y262661.jpg',
        status_id: 1,
        isPublic: true,
      },
      {
        id: 6,
        name: 'Khoa Luật',
        owner_id: 1,
        mustApprovePosts: true,
        description: 'Nhóm ngành về pháp luật, tư pháp, hành chính',
        thumbnail_url:
          'https://res.cloudinary.com/drinu8efl/image/upload/v1762967710/products/xdz34orxprxz6y262661.jpg',
        status_id: 1,
        isPublic: true,
      },
      {
        id: 7,
        name: 'Khoa Sư phạm',
        owner_id: 1,
        mustApprovePosts: true,
        description: 'Nhóm ngành đào tạo giáo viên các cấp',
        thumbnail_url:
          'https://res.cloudinary.com/drinu8efl/image/upload/v1762967710/products/xdz34orxprxz6y262661.jpg',
        status_id: 1,
        isPublic: true,
      },
      {
        id: 8,
        name: 'Khoa Nông nghiệp',
        owner_id: 1,
        mustApprovePosts: true,
        description: 'Nhóm ngành về trồng trọt, chăn nuôi, thủy sản',
        thumbnail_url:
          'https://res.cloudinary.com/drinu8efl/image/upload/v1762967710/products/xdz34orxprxz6y262661.jpg',
        status_id: 1,
        isPublic: true,
      },
      {
        id: 9,
        name: 'Khoa Kiến trúc',
        owner_id: 1,
        mustApprovePosts: true,
        description: 'Nhóm ngành thiết kế, kiến trúc, đồ họa',
        thumbnail_url:
          'https://res.cloudinary.com/drinu8efl/image/upload/v1762967710/products/xdz34orxprxz6y262661.jpg',
        status_id: 1,
        isPublic: true,
      },
      {
        id: 10,
        name: 'Khoa Du lịch',
        owner_id: 1,
        mustApprovePosts: true,
        description: 'Nhóm ngành dịch vụ, quản lý du lịch và khách sạn',
        thumbnail_url:
          'https://res.cloudinary.com/drinu8efl/image/upload/v1762967710/products/xdz34orxprxz6y262661.jpg',
        status_id: 1,
        isPublic: true,
      },
    ];

    for (const group of groups) {
      // 1. Kiểm tra nhóm đã tồn tại chưa
      let savedGroup = await groupRepo.findOne({ where: { id: group.id } });

      // 2. Nếu chưa, tạo nhóm
      if (!savedGroup) {
        savedGroup = await groupRepo.save(group);
      }

      // 3. Kiểm tra member đã tồn tại chưa
      const memberExists = await groupMemberRepo.findOne({
        where: {
          group_id: savedGroup.id,
          user_id: 1,
        },
      });

      if (!memberExists) {
        await groupMemberRepo.save({
          group_id: savedGroup.id,
          user_id: 1,
          group_role_id: 2,
          pending: 3,
        });
      }
    }

    console.log(' Seed groups thành công!.');
  }
}
