package cn.aiditto.api.persistence;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@TableName("questionnaire_answer_revision")
public class QuestionnaireAnswerRevision {

  @TableId(type = IdType.AUTO)
  private Long id;
  private Long userId;
  private String questionId;
  private String fromValue;
  private String toValue;
  private Integer viaBack;
  private String source;
  private LocalDateTime occurredAt;
}
