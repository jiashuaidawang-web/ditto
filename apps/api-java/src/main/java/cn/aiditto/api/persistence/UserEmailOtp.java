package cn.aiditto.api.persistence;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

/** Stores the OTP hash only. The plaintext code is never a column. */
@Getter
@Setter
@TableName("user_email_otp")
public class UserEmailOtp {

  @TableId(type = IdType.AUTO)
  private Long id;
  private String email;
  private String codeHash;
  private LocalDateTime expiresAt;
  private LocalDateTime consumedAt;
  private String ip;
  private LocalDateTime createdAt;
}
