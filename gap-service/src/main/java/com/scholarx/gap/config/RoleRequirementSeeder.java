package com.scholarx.gap.config;

import com.scholarx.gap.model.RoleRequirement;
import com.scholarx.gap.repository.RoleRequirementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class RoleRequirementSeeder implements CommandLineRunner {

    private final RoleRequirementRepository repository;

    @Override
    public void run(String... args) {
        if (repository.count() > 0) return;

        List<String[]> seeds = List.of(
            new String[]{"Full Stack Engineer",        "java",              "intermediate"},
            new String[]{"Full Stack Engineer",        "spring boot",       "intermediate"},
            new String[]{"Full Stack Engineer",        "rest apis",         "intermediate"},
            new String[]{"Full Stack Engineer",        "react",             "intermediate"},
            new String[]{"Full Stack Engineer",        "sql",               "intermediate"},
            new String[]{"Full Stack Engineer",        "docker",            "beginner"},
            new String[]{"Full Stack Engineer",        "git",               "beginner"},
            new String[]{"Full Stack Engineer",        "system design",     "intermediate"},
            new String[]{"Backend Engineer",           "java",              "expert"},
            new String[]{"Backend Engineer",           "spring boot",       "expert"},
            new String[]{"Backend Engineer",           "rest apis",         "expert"},
            new String[]{"Backend Engineer",           "sql",               "intermediate"},
            new String[]{"Backend Engineer",           "kafka",             "intermediate"},
            new String[]{"Backend Engineer",           "docker",            "intermediate"},
            new String[]{"Backend Engineer",           "system design",     "expert"},
            new String[]{"Backend Engineer",           "git",               "beginner"},
            new String[]{"DevOps / SRE",               "kubernetes",        "expert"},
            new String[]{"DevOps / SRE",               "docker",            "expert"},
            new String[]{"DevOps / SRE",               "ci/cd pipelines",   "expert"},
            new String[]{"DevOps / SRE",               "linux",             "intermediate"},
            new String[]{"DevOps / SRE",               "terraform",         "intermediate"},
            new String[]{"DevOps / SRE",               "prometheus",        "intermediate"},
            new String[]{"DevOps / SRE",               "git",               "intermediate"},
            new String[]{"DevOps / SRE",               "bash scripting",    "intermediate"},
            new String[]{"Data Engineer",              "python",            "expert"},
            new String[]{"Data Engineer",              "sql",               "expert"},
            new String[]{"Data Engineer",              "apache kafka",      "intermediate"},
            new String[]{"Data Engineer",              "spark",             "intermediate"},
            new String[]{"Data Engineer",              "airflow",           "beginner"},
            new String[]{"Data Engineer",              "docker",            "beginner"},
            new String[]{"Machine Learning Engineer",  "python",            "expert"},
            new String[]{"Machine Learning Engineer",  "pytorch",           "intermediate"},
            new String[]{"Machine Learning Engineer",  "scikit-learn",      "intermediate"},
            new String[]{"Machine Learning Engineer",  "sql",               "intermediate"},
            new String[]{"Machine Learning Engineer",  "docker",            "beginner"},
            new String[]{"Machine Learning Engineer",  "git",               "beginner"},
            new String[]{"Cloud Architect",            "aws",               "expert"},
            new String[]{"Cloud Architect",            "kubernetes",        "expert"},
            new String[]{"Cloud Architect",            "terraform",         "expert"},
            new String[]{"Cloud Architect",            "docker",            "intermediate"},
            new String[]{"Cloud Architect",            "networking",        "expert"},
            new String[]{"Cloud Architect",            "system design",     "expert"}
        );

        for (String[] row : seeds) {
            RoleRequirement r = new RoleRequirement();
            r.setRoleName(row[0]);
            r.setSkillName(row[1]);
            r.setRequiredLevel(row[2]);
            repository.save(r);
        }

        log.info("Seeded {} role requirements", seeds.size());
    }
}
