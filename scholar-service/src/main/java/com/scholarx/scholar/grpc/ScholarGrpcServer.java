package com.scholarx.scholar.grpc;

import com.scholarx.grpc.ScholarRequest;
import com.scholarx.grpc.ScholarResponse;
import com.scholarx.grpc.ScholarGrpcServiceGrpc;
import com.scholarx.scholar.model.Scholar;
import com.scholarx.scholar.repository.ScholarRepository;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import net.devh.boot.grpc.server.service.GrpcService;

@GrpcService
@RequiredArgsConstructor
public class ScholarGrpcServer extends ScholarGrpcServiceGrpc.ScholarGrpcServiceImplBase {

    private final ScholarRepository scholarRepository;

    @Override
    public void getScholarProfile(ScholarRequest request, StreamObserver<ScholarResponse> responseObserver) {
        Scholar scholar = scholarRepository.findById(request.getScholarId())
                .orElseThrow(() -> new RuntimeException("Scholar not found: " + request.getScholarId()));

        ScholarResponse response = ScholarResponse.newBuilder()
                .setScholarId(scholar.getId())
                .setName(scholar.getName())
                .setEmail(scholar.getEmail())
                .setTargetRole(scholar.getTargetRole() != null ? scholar.getTargetRole() : "")
                .setConversionDeadline(scholar.getConversionDeadline() != null ? scholar.getConversionDeadline().toString() : "")
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}
