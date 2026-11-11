package cn.aiditto.api.persistence;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

/** Append-only. The table rejects UPDATE and DELETE. */
@Getter
@Setter
@TableName("tracking_event")
public class TrackingEvent {

  @TableId(type = IdType.AUTO)
  private Long id;
  private String eventId;
  private String sessionId;
  private Long userId;
  private String name;
  private LocalDateTime occurredAt;
  private LocalDateTime receivedAt;
  private Integer durationMs;
  private String screenKey;
  private Integer screenIndex;
  private String questionId;
  private String optionId;
  private String props;
  private String ip;
  private String userAgent;
}
