package cn.aiditto.api.health;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import cn.aiditto.api.persistence.SchoolMapper;
import lombok.RequiredArgsConstructor;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationInfo;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class HealthController {

  static final String TIMEZONE = "Asia/Shanghai";
  static final String SERVICE = "ditto-api-java";

  private final SchoolMapper schoolMapper;
  private final Flyway flyway;

  @GetMapping("/health")
  public ResponseEntity<HealthResponse> health() {
    try {
      long schools = schoolMapper.selectCount(new QueryWrapper<>());
      return ResponseEntity.ok(new HealthResponse("ok", SERVICE, TIMEZONE, schemaVersion(), schools));
    } catch (RuntimeException ex) {
      return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
          .body(new HealthResponse("down", SERVICE, TIMEZONE, null, 0));
    }
  }

  private String schemaVersion() {
    MigrationInfo current = flyway.info().current();
    if (current == null || current.getVersion() == null) {
      return null;
    }
    return current.getVersion().getVersion();
  }
}
