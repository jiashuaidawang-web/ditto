package cn.aiditto.api.health;

public record HealthResponse(
    String status,
    String service,
    String timezone,
    String schemaVersion,
    long schools
) {
}
