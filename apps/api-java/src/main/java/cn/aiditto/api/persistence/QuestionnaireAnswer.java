package cn.aiditto.api.persistence;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

/** Current answer for one user and one catalog question id. JSON shape stays in the column. */
@Getter
@Setter
@TableName("questionnaire_answer")
public class QuestionnaireAnswer {

  @TableId(type = IdType.AUTO)
  private Long id;
  private Long userId;
  private String questionId;
  private String answerValue;
  private LocalDateTime updatedAt;
}
