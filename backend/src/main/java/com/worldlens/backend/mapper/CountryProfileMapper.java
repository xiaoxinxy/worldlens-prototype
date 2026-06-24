package com.worldlens.backend.mapper;

import com.worldlens.backend.entity.CountryProfileEntity;
import java.util.List;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

public interface CountryProfileMapper {
  @Select("select count(*) from wl_country_profile")
  int count();

  @Select("""
    select *
    from wl_country_profile
    where enabled = true
      and (#{continent} is null or continent = #{continent})
      and (
        #{keyword} is null
        or lower(code) like concat('%', lower(#{keyword}), '%')
        or lower(name) like concat('%', lower(#{keyword}), '%')
        or lower(name_en) like concat('%', lower(#{keyword}), '%')
        or lower(continent) like concat('%', lower(#{keyword}), '%')
        or lower(region) like concat('%', lower(#{keyword}), '%')
        or lower(capital) like concat('%', lower(#{keyword}), '%')
        or lower(summary) like concat('%', lower(#{keyword}), '%')
      )
    order by sort_order asc, population desc, name_en asc
    """)
  List<CountryProfileEntity> findPublic(@Param("continent") String continent, @Param("keyword") String keyword);

  @Select("""
    select *
    from wl_country_profile
    where (#{continent} is null or continent = #{continent})
      and (
        #{keyword} is null
        or lower(code) like concat('%', lower(#{keyword}), '%')
        or lower(name) like concat('%', lower(#{keyword}), '%')
        or lower(name_en) like concat('%', lower(#{keyword}), '%')
        or lower(continent) like concat('%', lower(#{keyword}), '%')
        or lower(region) like concat('%', lower(#{keyword}), '%')
        or lower(capital) like concat('%', lower(#{keyword}), '%')
        or lower(summary) like concat('%', lower(#{keyword}), '%')
      )
    order by sort_order asc, population desc, name_en asc
    """)
  List<CountryProfileEntity> findAdmin(@Param("continent") String continent, @Param("keyword") String keyword);

  @Select("""
    select count(*)
    from wl_country_profile
    where (#{continent} is null or continent = #{continent})
      and (
        #{keyword} is null
        or lower(code) like concat('%', lower(#{keyword}), '%')
        or lower(name) like concat('%', lower(#{keyword}), '%')
        or lower(name_en) like concat('%', lower(#{keyword}), '%')
        or lower(continent) like concat('%', lower(#{keyword}), '%')
        or lower(region) like concat('%', lower(#{keyword}), '%')
        or lower(capital) like concat('%', lower(#{keyword}), '%')
        or lower(summary) like concat('%', lower(#{keyword}), '%')
      )
    """)
  long countAdmin(@Param("continent") String continent, @Param("keyword") String keyword);

  @Select("""
    select *
    from wl_country_profile
    where (#{continent} is null or continent = #{continent})
      and (
        #{keyword} is null
        or lower(code) like concat('%', lower(#{keyword}), '%')
        or lower(name) like concat('%', lower(#{keyword}), '%')
        or lower(name_en) like concat('%', lower(#{keyword}), '%')
        or lower(continent) like concat('%', lower(#{keyword}), '%')
        or lower(region) like concat('%', lower(#{keyword}), '%')
        or lower(capital) like concat('%', lower(#{keyword}), '%')
        or lower(summary) like concat('%', lower(#{keyword}), '%')
      )
    order by sort_order asc, population desc, name_en asc
    limit #{limit} offset #{offset}
    """)
  List<CountryProfileEntity> findAdminPage(
      @Param("continent") String continent,
      @Param("keyword") String keyword,
      @Param("limit") int limit,
      @Param("offset") int offset
  );

  @Select("select * from wl_country_profile where code = #{code} and enabled = true")
  CountryProfileEntity findPublicByCode(@Param("code") String code);

  @Select("select * from wl_country_profile where code = #{code}")
  CountryProfileEntity findByCode(@Param("code") String code);

  @Select("select distinct continent from wl_country_profile where enabled = true order by continent asc")
  List<String> findContinents();

  @Insert("""
    insert into wl_country_profile (
      code, name, name_en, continent, region, capital, latitude, longitude,
      population, area_km2, languages_json, language_group, language_group_label,
      language_color, tone_group, tone_group_label, tone_color, summary,
      culture_note, civilization_tags_json, cover_image, enabled, sort_order
    )
    values (
      #{code}, #{name}, #{nameEn}, #{continent}, #{region}, #{capital}, #{latitude}, #{longitude},
      #{population}, #{areaKm2}, #{languagesJson}, #{languageGroup}, #{languageGroupLabel},
      #{languageColor}, #{toneGroup}, #{toneGroupLabel}, #{toneColor}, #{summary},
      #{cultureNote}, #{civilizationTagsJson}, #{coverImage}, #{enabled}, #{sortOrder}
    )
    """)
  void insert(CountryProfileEntity country);

  @Update("""
    update wl_country_profile
    set name = #{name},
        name_en = #{nameEn},
        continent = #{continent},
        region = #{region},
        capital = #{capital},
        latitude = #{latitude},
        longitude = #{longitude},
        population = #{population},
        area_km2 = #{areaKm2},
        languages_json = #{languagesJson},
        language_group = #{languageGroup},
        language_group_label = #{languageGroupLabel},
        language_color = #{languageColor},
        tone_group = #{toneGroup},
        tone_group_label = #{toneGroupLabel},
        tone_color = #{toneColor},
        summary = #{summary},
        culture_note = #{cultureNote},
        civilization_tags_json = #{civilizationTagsJson},
        cover_image = #{coverImage},
        enabled = #{enabled},
        sort_order = #{sortOrder},
        updated_at = current_timestamp
    where code = #{code}
    """)
  void update(CountryProfileEntity country);

  @Update("""
    update wl_country_profile
    set enabled = #{enabled},
        updated_at = current_timestamp
    where code = #{code}
    """)
  void updateEnabled(@Param("code") String code, @Param("enabled") boolean enabled);

  @Delete("delete from wl_country_profile where code = #{code}")
  void delete(@Param("code") String code);
}
