package cn.aiditto.api.persistence;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@TableName("weekly_submission")
public class WeeklySubmission {

  @TableId(type = IdType.AUTO)
  private Long id;
  private Long userId;
  private String cycleKey;
  private LocalDateTime submittedAt;
  private String answerSnapshot;
}
