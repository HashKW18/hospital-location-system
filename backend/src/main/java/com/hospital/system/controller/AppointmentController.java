package com.hospital.system.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private static final List<Map<String, Object>> TODAY_APPOINTMENTS = new ArrayList<>();

    static {
        TODAY_APPOINTMENTS.add(createAppt(1L, "09:45 AM", "James Carter", "Cardiology", "Room 304", "In Progress"));
        TODAY_APPOINTMENTS.add(createAppt(2L, "10:30 AM", "Elena Rostova", "General Checkup", "Room 102", "Waiting"));
        TODAY_APPOINTMENTS.add(createAppt(3L, "11:15 AM", "Marcus Vance", "Cardiology", "Room 304", "Scheduled"));
        TODAY_APPOINTMENTS.add(createAppt(4L, "11:45 AM", "David Miller", "Cardiology", "Room 304", "Scheduled"));
        TODAY_APPOINTMENTS.add(createAppt(5L, "01:30 PM", "Sophia Hayes", "Cardiology", "Room 304", "Waiting"));
        TODAY_APPOINTMENTS.add(createAppt(6L, "02:15 PM", "Oliver Bennett", "Pediatrics", "Room 105", "Scheduled"));
    }

    private static Map<String, Object> createAppt(Long id, String time, String patient, String dept, String room, String status) {
        Map<String, Object> appt = new HashMap<>();
        appt.put("id", id);
        appt.put("time", time);
        appt.put("patientName", patient);
        appt.put("department", dept);
        appt.put("room", room);
        appt.put("status", status);
        return appt;
    }

    @GetMapping("/today")
    public ResponseEntity<List<Map<String, Object>>> getTodayAppointments() {
        return ResponseEntity.ok(TODAY_APPOINTMENTS);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createAppointment(@RequestBody Map<String, Object> body) {
        long newId = System.currentTimeMillis();
        String time = (String) body.getOrDefault("time", "10:00 AM");
        String patient = (String) body.getOrDefault("patientName", "Patient");
        String dept = (String) body.getOrDefault("department", "Cardiology");
        String room = (String) body.getOrDefault("room", "Room 304");
        String status = (String) body.getOrDefault("status", "Scheduled");
        Map<String, Object> appt = createAppt(newId, time, patient, dept, room, status);
        TODAY_APPOINTMENTS.add(appt);
        return ResponseEntity.ok(appt);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateAppointment(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        for (Map<String, Object> a : TODAY_APPOINTMENTS) {
            if (a.get("id").equals(id)) {
                if (body.containsKey("patientName")) a.put("patientName", body.get("patientName"));
                if (body.containsKey("time")) a.put("time", body.get("time"));
                if (body.containsKey("department")) a.put("department", body.get("department"));
                if (body.containsKey("room")) a.put("room", body.get("room"));
                if (body.containsKey("status")) a.put("status", body.get("status"));
                return ResponseEntity.ok(a);
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        for (Map<String, Object> a : TODAY_APPOINTMENTS) {
            if (a.get("id").equals(id)) {
                a.put("status", newStatus);
                return ResponseEntity.ok(a);
            }
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
        TODAY_APPOINTMENTS.removeIf(a -> a.get("id").equals(id));
        return ResponseEntity.noContent().build();
    }
}
