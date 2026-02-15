DROP MATERIALIZED VIEW IF EXISTS mv_dashboard_analitik;

CREATE MATERIALIZED VIEW mv_dashboard_analitik AS
 SELECT row_number() OVER (ORDER BY p.nik, d.id) AS id,
    p.nama_ptk,
    p.nik,
    p.nuptk,
    p.nip,
    p.jenis_kelamin,
    p.tanggal_lahir,
    p.no_hp,
    p.jenis_ptk,
    p.jabatan_ptk,
    p.riwayat_pend_jenjang,
    p.riwayat_pend_bidang,
    p.riwayat_sertifikasi,
    p.status_kepegawaian,
    p.pangkat_golongan,
    EXTRACT(year FROM age(CURRENT_DATE::timestamp with time zone, p.tanggal_lahir::timestamp with time zone))::integer AS usia_tahun,
    s.nama AS nama_sekolah,
    s.npsn AS npsn_sekolah,
    s.bentuk_pendidikan,
    TRIM(BOTH FROM w.kecamatan) AS kecamatan,
    TRIM(BOTH FROM w.kabupaten) AS kabupaten,
        CASE
            WHEN h.status_kelulusan::text = 'Lulus'::text THEN true
            ELSE false
        END AS is_sudah_pelatihan,
        CASE
            WHEN p.jenis_ptk::text ~~* '%Kepala Sekolah%'::text THEN true
            ELSE false
        END AS is_kepala_sekolah,
    d.title AS judul_diklat,
    d.total_jp,
    d.start_date,
    d.end_date,
    rm.mode_name AS moda_diklat,
    d.sub_topic_id,
    rst.topic_id,
    d.category_id,
    d.jenis_kegiatan,
    d.jenis_program,
    h.status_kelulusan
   FROM data_ptk p
     JOIN satuan_pendidikan s ON p.npsn = s.npsn
     JOIN ref_wilayah w ON s.kode_kecamatan = w.kode_kecamatan
     LEFT JOIN data_alumni h ON p.nik::text = h.nik::text
     LEFT JOIN master_diklat d ON h.id_diklat = d.id
     LEFT JOIN ref_sub_topik rst ON d.sub_topic_id = rst.id
     LEFT JOIN ref_kategori k ON d.category_id = k.origin_id
     LEFT JOIN ref_mode rm ON d.mode_id = rm.id;

CREATE UNIQUE INDEX idx_mv_dashboard_analitik_id ON mv_dashboard_analitik (id);
CREATE INDEX idx_mv_nik ON mv_dashboard_analitik (nik);
CREATE INDEX idx_mv_distinct_opt ON mv_dashboard_analitik (nik, start_date DESC);
CREATE INDEX idx_mv_kepsek ON mv_dashboard_analitik (is_kepala_sekolah);
CREATE INDEX idx_mv_sudah_pelatihan ON mv_dashboard_analitik (is_sudah_pelatihan);
CREATE INDEX idx_mv_nama ON mv_dashboard_analitik (nama_ptk);
CREATE INDEX idx_mv_sekolah ON mv_dashboard_analitik (nama_sekolah);
CREATE INDEX idx_mv_kabupaten ON mv_dashboard_analitik (kabupaten);
CREATE INDEX idx_mv_kecamatan ON mv_dashboard_analitik (kecamatan);
CREATE INDEX idx_mv_jenjang ON mv_dashboard_analitik (bentuk_pendidikan);
CREATE INDEX idx_mv_mapel ON mv_dashboard_analitik (riwayat_sertifikasi);
CREATE INDEX idx_mv_status ON mv_dashboard_analitik (status_kepegawaian);
CREATE INDEX idx_mv_usia ON mv_dashboard_analitik (usia_tahun);
CREATE INDEX idx_mv_rumpun ON mv_dashboard_analitik (topic_id);
CREATE INDEX idx_mv_sub_rumpun ON mv_dashboard_analitik (sub_topic_id);
CREATE INDEX idx_mv_kategori ON mv_dashboard_analitik (category_id);
CREATE INDEX idx_mv_judul_diklat ON mv_dashboard_analitik (judul_diklat);

REFRESH MATERIALIZED VIEW mv_dashboard_analitik;