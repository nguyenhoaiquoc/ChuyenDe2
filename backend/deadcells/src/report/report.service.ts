import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common'; 
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { Report } from 'src/entities/report.entity';
import { User } from 'src/entities/user.entity';
import { Status } from 'src/entities/status.entity';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name); 

  constructor(
    @InjectRepository(Report)
    private readonly reportRepo: Repository<Report>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Status)
    private readonly statusRepo: Repository<Status>,
  ) {}

  async create(data: any) {
    const getNumberId = (id: any) => (id ? Number(id) : undefined);

    const reporterId = getNumberId(data.reporter_id);
    const reportedUserId = getNumberId(data.reported_user_id);

    if (!reporterId && reportedUserId) {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const recentComplaint = await this.reportRepo.findOne({
        where: {
          reported_user: { id: reportedUserId }, 
          reporter: IsNull(),                   
          createdAt: MoreThan(twentyFourHoursAgo), 
        },
      });

      if (recentComplaint) {
        // Tính thời gian còn lại
        const waitTime = new Date(recentComplaint.createdAt).getTime() + (24 * 60 * 60 * 1000) - Date.now();
        const hoursLeft = Math.ceil(waitTime / (1000 * 60 * 60));
        
        throw new BadRequestException(`Bạn đã gửi khiếu nại rồi. Vui lòng đợi ${hoursLeft} giờ nữa để gửi tiếp.`);
      }
    }

    const reportEntity = this.reportRepo.create({
      reason: data.reason,
      reporter: reporterId ? { id: reporterId } : undefined,
      reported_user: reportedUserId ? { id: reportedUserId } : undefined,
      status: { id: 1 },
    });

    const savedReport = await this.reportRepo.save(reportEntity); //  Lưu kết quả vào biến

    //  LOG THÔNG BÁO BÁO CÁO MỚI
    this.logger.log(
      `📝 BÁO CÁO MỚI (ID: ${savedReport.id}) | Lý do: "${savedReport.reason}" | 
        Reporter: ${reporterId} | 
        Reported User: ${reportedUserId}`,
    );

    return savedReport;
  }

  async findAll() {
    return await this.reportRepo.find({
      relations: ['reporter', 'reported_user', 'status'],
      order: { createdAt: 'DESC' }, // Sắp xếp mới nhất lên đầu
    });
  }

  //  1. Xem chi tiết báo cáo (sử dụng lại logic findAll nhưng có thêm điều kiện where)
  async findOne(id: number) {
    const report = await this.reportRepo.findOne({
      where: { id },
      relations: ['reporter', 'reported_user', 'status'],
    });

    if (!report) {
      throw new NotFoundException(`Không tìm thấy báo cáo ID ${id}`);
    }
    return report;
  }

  //  2. Cập nhật trạng thái báo cáo
  async updateStatus(id: number, statusId: number) {
    const report = await this.reportRepo.findOneBy({ id });

    if (!report) {
      throw new NotFoundException(`Không tìm thấy báo cáo ID ${id}`);
    }

    // Giả định Status ID 2 là "Đã xử lý"
    report.status = { id: statusId } as any;
    const updatedReport = await this.reportRepo.save(report);

    this.logger.log(
      ` Báo cáo ID ${id} đã được chuyển sang Status ID ${statusId}`,
    );

    return updatedReport;
  }

  //  3. Quản lý trạng thái User (Khóa/Mở khóa)
  // Lưu ý: Hàm này yêu cầu bạn đã inject User Entity Repository và Status Entity Repository
  async updateUserStatus(userId: number, newStatusId: number) {
    const action = newStatusId === 3 ? 'Khóa' : 'Mở khóa';

    // 1. Tìm kiếm User
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['status'], // Đảm bảo load cả mối quan hệ Status
    });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng ID ${userId}`);
    }

    // 2. Kiểm tra Status có tồn tại không
    const status = await this.statusRepo.findOneBy({ id: newStatusId });
    if (!status) {
      throw new NotFoundException(
        `Không tìm thấy Status ID ${newStatusId} (${action})`,
      );
    }

    // 3. Cập nhật Status ID và Status Entity
    user.statusId = newStatusId; // Cập nhật khóa ngoại
    user.status = status; // Cập nhật mối quan hệ

    await this.userRepo.save(user);

    this.logger.warn(
      `🔑 [ADMIN ACTION] Đã thực hiện logic ${action} tài khoản User ID ${userId} (Status: ${status.name} / ID ${newStatusId})`,
    );

    return {
      success: true,
      message: `${action} tài khoản ${user.nickname || user.fullName || userId} thành công.`,
    };
  }

  async remove(id: number) {
    // Kiểm tra xem báo cáo có tồn tại không trước khi xóa
    const report = await this.reportRepo.findOneBy({ id });

    if (!report) {
      throw new NotFoundException(`Không tìm thấy báo cáo ID ${id} để xóa.`);
    }

    // Thực hiện xóa
    await this.reportRepo.delete(id);

    // Log lại hành động
    this.logger.warn(`🗑️ [ADMIN ACTION] Đã xóa báo cáo ID ${id}`);

    return {
      success: true,
      message: `Đã xóa thành công báo cáo ID ${id}`,
    };
  }
}
