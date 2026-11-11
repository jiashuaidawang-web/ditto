package cn.aiditto.api;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class WebStackTest {

  @Test
  void servletStackDoesNotPullWebFlux() {
    assertThatThrownBy(() -> Class.forName("org.springframework.web.reactive.DispatcherHandler"))
        .isInstanceOf(ClassNotFoundException.class);
  }
}
