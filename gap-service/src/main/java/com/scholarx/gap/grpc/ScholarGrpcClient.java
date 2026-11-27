package com.scholarx.gap.grpc;

import com.scholarx.grpc.ScholarGrpcServiceGrpc;
import com.scholarx.grpc.ScholarRequest;
import com.scholarx.grpc.ScholarResponse;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class ScholarGrpcClient {

    @GrpcClient("scholar-service")
    private ScholarGrpcServiceGrpc.ScholarGrpcServiceBlockingStub scholarStub;

    @CircuitBreaker(name = "scholarService", fallbackMethod = "fallbackProfile")
    public ScholarResponse getScholarProfile(String scholarId) {
        return scholarStub.getScholarProfile(
                ScholarRequest.newBuilder().setScholarId(scholarId).build()
        );
    }

    public ScholarResponse fallbackProfile(String scholarId, Throwable t) {
        log.warn("Circuit breaker open for scholar {}: {}", scholarId, t.getMessage());
        return ScholarResponse.newBuilder()
                .setScholarId(scholarId)
                .setName("Unknown")
                .setEmail("")
                .setTargetRole("")
                .build();
    }
}
