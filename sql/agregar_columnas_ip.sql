-- =============================================
-- Script para agregar columnas de IP a equipos_pc
-- Ejecutar en phpMyAdmin o en la consola MySQL
-- =============================================

ALTER TABLE equipos_pc
  ADD COLUMN ip_asignada VARCHAR(15) DEFAULT NULL AFTER descripcion_equipo,
  ADD COLUMN mascara VARCHAR(15) DEFAULT '255.255.255.0' AFTER ip_asignada,
  ADD COLUMN gateway VARCHAR(15) DEFAULT '192.168.1.1' AFTER mascara,
  ADD COLUMN dns_primario VARCHAR(15) DEFAULT '8.8.8.8' AFTER gateway,
  ADD COLUMN dns_secundario VARCHAR(15) DEFAULT '8.8.4.4' AFTER dns_primario;
