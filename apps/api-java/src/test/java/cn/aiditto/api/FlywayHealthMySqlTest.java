package cn.aiditto.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import cn.aiditto.api.persistence.School;
import cn.aiditto.api.persistence.SchoolMapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.client.RestClient;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.mysql.MySQLContainer;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class FlywayHealthMySqlTest {

  private static final List<String> V1_TABLES = List.of(
      "school",
      "app_user",
      "user_email_otp",
      "questionnaire_answer",
      "questionnaire_answer_revision",
      "user_photo",
      "weekly_submission",
      "tracking_session",
      "tracking_event"
  );

  private static final List<String> PHASE_2_TABLES = List.of(
      "match_cycle",
      "match_result",
      "blocklist",
      "meetup"
  );

  @Container
  @ServiceConnection
  static final MySQLContainer MYSQL = new MySQLContainer("mysql:8.0")
      .withCommand(
          "--character-set-server=utf8mb4",
          "--collation-server=utf8mb4_0900_ai_ci",
          "--default-time-zone=+08:00",
          "--skip-log-bin",
          "--log-bin-trust-function-creators=1"
      )
      .withUrlParam("connectionTimeZone", "Asia/Shanghai")
      .withUrlParam("forceConnectionTimeZoneToSession", "true")
      .withEnv("TZ", "Asia/Shanghai");

  @Autowired
  private JdbcTemplate jdbc;

  @Autowired
  private SchoolMapper schoolMapper;

  @LocalServerPort
  private int port;

  @Test
  void flywayAppliesV1AndHealthResponds() {
    Set<String> tables = tableNames();
    assertThat(tables).containsAll(V1_TABLES);
    assertThat(tables).doesNotContainAnyElementsOf(PHASE_2_TABLES);

    assertThat(columns("school")).containsExactlyInAnyOrder(
        "id", "code", "name", "city", "district", "enabled", "created_at");
    assertThat(columns("app_user")).containsExactlyInAnyOrder(
        "id", "public_id", "display_name", "email", "email_verified_at", "school_id", "status",
        "created_at", "updated_at");
    assertThat(columns("user_email_otp")).containsExactlyInAnyOrder(
        "id", "email", "code_hash", "expires_at", "consumed_at", "ip", "created_at");
    assertThat(columns("questionnaire_answer")).containsExactlyInAnyOrder(
        "id", "user_id", "question_id", "answer_value", "updated_at");
    assertThat(columns("questionnaire_answer_revision")).containsExactlyInAnyOrder(
        "id", "user_id", "question_id", "from_value", "to_value", "via_back", "source", "occurred_at");
    assertThat(columns("user_photo")).containsExactlyInAnyOrder(
        "id", "user_id", "slot", "storage_key", "created_at");
    assertThat(columns("weekly_submission")).containsExactlyInAnyOrder(
        "id", "user_id", "cycle_key", "submitted_at", "answer_snapshot");
    assertThat(columns("tracking_session")).containsExactlyInAnyOrder(
        "id", "session_id", "visitor_id", "user_id", "started_at", "ended_at", "entry_url", "referrer",
        "first_ip", "last_ip", "user_agent", "device_class", "consent", "landing_screen",
        "last_screen_key", "last_screen_index", "screens_seen_count", "had_cta_click", "quiz_started",
        "quiz_submitted", "created_at", "updated_at");
    assertThat(columns("tracking_event")).containsExactlyInAnyOrder(
        "id", "event_id", "session_id", "user_id", "name", "occurred_at", "received_at", "duration_ms",
        "screen_key", "screen_index", "question_id", "option_id", "props", "ip", "user_agent");

    assertThat(columnType("app_user", "id")).isEqualTo("bigint");
    assertThat(columnType("app_user", "public_id")).isEqualTo("char(36)");
    assertThat(columnType("app_user", "created_at")).isEqualTo("datetime(3)");
    assertThat(columnType("user_email_otp", "code_hash")).isEqualTo("char(64)");
    assertThat(columnType("questionnaire_answer", "answer_value")).isEqualTo("json");
    assertThat(columnType("tracking_session", "entry_url")).isEqualTo("text");
    assertThat(tableCollation("school")).isEqualTo("utf8mb4_0900_ai_ci");
    assertThat(columnCharset("school", "name")).isEqualTo("utf8mb4");

    assertThat(uniqueIndexColumns("questionnaire_answer", "uk_questionnaire_answer_user_question"))
        .containsExactly("user_id", "question_id");
    assertThat(uniqueIndexColumns("user_photo", "uk_user_photo_user_slot"))
        .containsExactly("user_id", "slot");
    assertThat(uniqueIndexColumns("weekly_submission", "uk_weekly_submission_user_cycle"))
        .containsExactly("user_id", "cycle_key");
    assertThat(uniqueIndexColumns("school", "uk_school_code")).containsExactly("code");
    assertThat(indexColumns("user_email_otp", "idx_user_email_otp_email_created"))
        .containsExactly("email", "created_at");
    assertThat(indexColumns("tracking_event", "idx_tracking_event_session_occurred"))
        .containsExactly("session_id", "occurred_at");
    assertThat(indexColumns("tracking_event", "idx_tracking_event_name_occurred"))
        .containsExactly("name", "occurred_at");
    assertThat(indexColumns("tracking_event", "idx_tracking_event_user_occurred"))
        .containsExactly("user_id", "occurred_at");
    assertThat(indexColumns("tracking_event", "idx_tracking_event_question_name"))
        .containsExactly("question_id", "name");
    assertThat(indexColumns("tracking_session", "idx_tracking_session_user_started"))
        .containsExactly("user_id", "started_at");
    assertThat(indexColumns("tracking_session", "idx_tracking_session_started"))
        .containsExactly("started_at");
    assertThat(indexColumns("tracking_session", "idx_tracking_session_last_screen"))
        .containsExactly("last_screen_index");

    List<School> schools = schoolMapper.selectList(new QueryWrapper<School>().orderByAsc("code"));
    assertThat(schools).extracting(School::getCode).containsExactly(
        "bit_liangxiang", "btbu", "bucm", "cnu_liangxiang", "ucass");
    assertThat(schools).extracting(School::getName).containsExactly(
        "北京理工大学（良乡校区）",
        "北京工商大学（良乡校区）",
        "北京中医药大学",
        "首都师范大学（良乡校区）",
        "中国社会科学院大学");
    assertThat(schools).allSatisfy(school -> {
      assertThat(school.getCity()).isEqualTo("北京");
      assertThat(school.getDistrict()).isEqualTo("房山");
      assertThat(school.getEnabled()).isEqualTo(1);
    });

    jdbc.update(
        "INSERT INTO app_user (public_id, status, created_at, updated_at) VALUES (?, 'active', ?, ?)",
        "11111111-1111-1111-1111-111111111111",
        "2026-11-11 12:00:00.000",
        "2026-11-11 12:00:00.000");
    Long userId = jdbc.queryForObject(
        "SELECT id FROM app_user WHERE public_id = ?",
        Long.class,
        "11111111-1111-1111-1111-111111111111");
    jdbc.update(
        "INSERT INTO questionnaire_answer (user_id, question_id, answer_value, updated_at) VALUES (?, 'intent', ?, ?)",
        userId,
        "{\"kind\":\"single\",\"id\":\"serious\"}",
        "2026-11-11 12:00:00.000");
    assertThatThrownBy(() -> jdbc.update(
        "INSERT INTO questionnaire_answer (user_id, question_id, answer_value, updated_at) VALUES (?, 'intent', ?, ?)",
        userId,
        "{\"kind\":\"single\",\"id\":\"friends\"}",
        "2026-11-11 12:01:00.000"))
        .isInstanceOf(org.springframework.dao.DataAccessException.class);

    jdbc.update(
        "INSERT INTO user_photo (user_id, slot, storage_key, created_at) VALUES (?, 0, 'slot-0', ?)",
        userId,
        "2026-11-11 12:00:00.000");
    jdbc.update(
        "INSERT INTO user_photo (user_id, slot, storage_key, created_at) VALUES (?, 5, 'slot-5', ?)",
        userId,
        "2026-11-11 12:00:00.000");
    assertThatThrownBy(() -> jdbc.update(
        "INSERT INTO user_photo (user_id, slot, storage_key, created_at) VALUES (?, 6, 'slot-6', ?)",
        userId,
        "2026-11-11 12:00:00.000"))
        .isInstanceOf(org.springframework.dao.DataAccessException.class);

    jdbc.update(
        "INSERT INTO tracking_session (session_id, started_at, consent, created_at, updated_at) VALUES (?, ?, 1, ?, ?)",
        "22222222-2222-2222-2222-222222222222",
        "2026-11-11 16:00:00.000",
        "2026-11-11 16:00:00.000",
        "2026-11-11 16:00:00.000");
    jdbc.update(
        "INSERT INTO tracking_event (event_id, session_id, name, occurred_at, received_at) VALUES (?, ?, 'marketing.page_view', ?, ?)",
        "33333333-3333-3333-3333-333333333333",
        "22222222-2222-2222-2222-222222222222",
        "2026-11-11 16:00:00.000",
        "2026-11-11 16:00:01.000");
    assertThatThrownBy(() -> jdbc.update(
        "UPDATE tracking_event SET name = 'rewritten' WHERE event_id = ?",
        "33333333-3333-3333-3333-333333333333"))
        .isInstanceOf(org.springframework.dao.DataAccessException.class);
    assertThatThrownBy(() -> jdbc.update(
        "DELETE FROM tracking_event WHERE event_id = ?",
        "33333333-3333-3333-3333-333333333333"))
        .isInstanceOf(org.springframework.dao.DataAccessException.class);

    @SuppressWarnings("unchecked")
    Map<String, Object> body = RestClient.create()
        .get()
        .uri("http://127.0.0.1:" + port + "/health")
        .retrieve()
        .body(Map.class);
    assertThat(body).isNotNull();
    assertThat(body.get("status")).isEqualTo("ok");
    assertThat(body.get("service")).isEqualTo("ditto-api-java");
    assertThat(body.get("timezone")).isEqualTo("Asia/Shanghai");
    assertThat(body.get("schemaVersion")).isEqualTo("1");
    assertThat(((Number) body.get("schools")).intValue()).isEqualTo(5);
  }

  private Set<String> tableNames() {
    return Set.copyOf(jdbc.queryForList(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE()",
        String.class));
  }

  private Set<String> columns(String table) {
    return Set.copyOf(jdbc.queryForList(
        "SELECT column_name FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ?",
        String.class,
        table));
  }

  private String columnType(String table, String column) {
    return jdbc.queryForObject(
        "SELECT column_type FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?",
        String.class,
        table,
        column);
  }

  private String tableCollation(String table) {
    return jdbc.queryForObject(
        "SELECT table_collation FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?",
        String.class,
        table);
  }

  private String columnCharset(String table, String column) {
    return jdbc.queryForObject(
        "SELECT character_set_name FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?",
        String.class,
        table,
        column);
  }

  private List<String> uniqueIndexColumns(String table, String index) {
    Integer nonUnique = jdbc.queryForObject(
        "SELECT non_unique FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ? LIMIT 1",
        Integer.class,
        table,
        index);
    assertThat(nonUnique).isZero();
    return indexColumns(table, index);
  }

  private List<String> indexColumns(String table, String index) {
    return jdbc.query(
        "SELECT column_name FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ? ORDER BY seq_in_index",
        (rs, row) -> rs.getString(1),
        table,
        index);
  }
}
