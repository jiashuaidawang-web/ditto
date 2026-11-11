package cn.aiditto.api.persistence;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@TableName("app_user")
public class AppUser {

  @TableId(type = IdType.AUTO)
  private Long id;
  private String publicId;
  private String displayName;
  private String email;
  private LocalDateTime emailVerifiedAt;
  private Long schoolId;
  private String status;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
