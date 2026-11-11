package cn.aiditto.api.persistence;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@TableName("user_photo")
public class UserPhoto {

  @TableId(type = IdType.AUTO)
  private Long id;
  private Long userId;
  private Integer slot;
  private String storageKey;
  private LocalDateTime createdAt;
}
