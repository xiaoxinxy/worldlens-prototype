package com.worldlens.backend.mapper;

import com.worldlens.backend.entity.TerrainFeatureEntity;
import java.util.List;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

public interface TerrainFeatureMapper {
  @Select("select count(*) from wl_terrain_feature")
  int count();

  @Select("""
    select *
    from wl_terrain_feature
    where enabled = true
      and (#{type} is null or terrain_type = #{type})
      and (
        #{keyword} is null
        or lower(id) like concat('%', lower(#{keyword}), '%')
        or lower(name) like concat('%', lower(#{keyword}), '%')
        or lower(name_en) like concat('%', lower(#{keyword}), '%')
        or lower(region) like concat('%', lower(#{keyword}), '%')
      )
    order by sort_order asc, name_en asc
    """)
  List<TerrainFeatureEntity> findPublic(@Param("type") String type, @Param("keyword") String keyword);

  @Select("""
    select *
    from wl_terrain_feature
    where (#{type} is null or terrain_type = #{type})
      and (
        #{keyword} is null
        or lower(id) like concat('%', lower(#{keyword}), '%')
        or lower(name) like concat('%', lower(#{keyword}), '%')
        or lower(name_en) like concat('%', lower(#{keyword}), '%')
        or lower(region) like concat('%', lower(#{keyword}), '%')
      )
    order by sort_order asc, name_en asc
    """)
  List<TerrainFeatureEntity> findAdmin(@Param("type") String type, @Param("keyword") String keyword);

  @Select("select * from wl_terrain_feature where id = #{id} and enabled = true")
  TerrainFeatureEntity findPublicById(@Param("id") String id);

  @Select("select * from wl_terrain_feature where id = #{id}")
  TerrainFeatureEntity findById(@Param("id") String id);

  @Insert("""
    insert into wl_terrain_feature (
      id, name, name_en, terrain_type, type_label, continent, region,
      country_codes_json, latitude, longitude, summary, formation_reason,
      highest_point, length_label, area_label, tags_json, cover_image,
      enabled, sort_order
    )
    values (
      #{id}, #{name}, #{nameEn}, #{terrainType}, #{typeLabel}, #{continent}, #{region},
      #{countryCodesJson}, #{latitude}, #{longitude}, #{summary}, #{formationReason},
      #{highestPoint}, #{lengthLabel}, #{areaLabel}, #{tagsJson}, #{coverImage},
      #{enabled}, #{sortOrder}
    )
    """)
  void insert(TerrainFeatureEntity feature);

  @Update("""
    update wl_terrain_feature
    set name = #{name},
        name_en = #{nameEn},
        terrain_type = #{terrainType},
        type_label = #{typeLabel},
        continent = #{continent},
        region = #{region},
        country_codes_json = #{countryCodesJson},
        latitude = #{latitude},
        longitude = #{longitude},
        summary = #{summary},
        formation_reason = #{formationReason},
        highest_point = #{highestPoint},
        length_label = #{lengthLabel},
        area_label = #{areaLabel},
        tags_json = #{tagsJson},
        cover_image = #{coverImage},
        enabled = #{enabled},
        sort_order = #{sortOrder},
        updated_at = current_timestamp
    where id = #{id}
    """)
  void update(TerrainFeatureEntity feature);

  @Update("""
    update wl_terrain_feature
    set enabled = #{enabled},
        updated_at = current_timestamp
    where id = #{id}
    """)
  void updateEnabled(@Param("id") String id, @Param("enabled") boolean enabled);

  @Delete("delete from wl_terrain_feature where id = #{id}")
  void delete(@Param("id") String id);
}
