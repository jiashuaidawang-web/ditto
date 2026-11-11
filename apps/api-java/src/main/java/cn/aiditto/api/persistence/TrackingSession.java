package cn.aiditto.api.persistence;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@TableName("tracking_session")
public class TrackingSession {

  @TableId(type = IdType.AUTO)
  private Long id;
  private String sessionId;
  private String visitorId;
  private Long userId;
  private LocalDateTime startedAt;
  private LocalDateTime endedAt;
  private String entryUrl;
  private String referrer;
  private String firstIp;
  private String lastIp;
  private String userAgent;
  private String deviceClass;
  private Integer consent;
  private String landingScreen;
  private String lastScreenKey;
  private Integer lastScreenIndex;
  private Integer screensSeenCount;
  private Integer hadCtaClick;
  private Integer quizStarted;
  private Integer quizSubmitted;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
