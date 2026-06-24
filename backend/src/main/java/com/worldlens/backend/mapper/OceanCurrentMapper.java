package com.worldlens.backend.mapper;

import com.worldlens.backend.entity.OceanCurrentEntity;
import java.util.List;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

public interface OceanCurrentMapper {
  @Select("select count(*) from wl_ocean_current")
  int count();

  @Select("""
    select *
    from wl_ocean_current
    where enabled = true
      and (#{kind} is null or kind = #{kind})
      and (
        #{keyword} is null
        or lower(id) like concat('%', lower(#{keyword}), '%')
        or lower(name) like concat('%', lower(#{keyword}), '%')
        or lower(name_en) like concat('%', lower(#{keyword}), '%')
        or lower(basin) like concat('%', lower(#{keyword}), '%')
        or lower(current_system) like concat('%', lower(#{keyword}), '%')
      )
    order by sort_order asc, name_en asc
    """)
  List<OceanCurrentEntity> findAll(@Param("kind") String kind, @Param("keyword") String keyword);

  @Select("""
    select *
    from wl_ocean_current
    where (#{kind} is null or kind = #{kind})
      and (
        #{keyword} is null
        or lower(id) like concat('%', lower(#{keyword}), '%')
        or lower(name) like concat('%', lower(#{keyword}), '%')
        or lower(name_en) like concat('%', lower(#{keyword}), '%')
        or lower(basin) like concat('%', lower(#{keyword}), '%')
        or lower(current_system) like concat('%', lower(#{keyword}), '%')
      )
    order by sort_order asc, name_en asc
    """)
  List<OceanCurrentEntity> findAllForAdmin(@Param("kind") String kind, @Param("keyword") String keyword);

  @Select("select * from wl_ocean_current where id = #{id} and enabled = true")
  OceanCurrentEntity findPublicById(@Param("id") String id);

  @Select("select * from wl_ocean_current where id = #{id}")
  OceanCurrentEntity findById(@Param("id") String id);

  @Insert("""
    insert into wl_ocean_current (
      id, name, name_en, kind, basin, current_system, direction, source, effect,
      impact_tags_json, textbook_note, influence_lat, influence_lng,
      influence_radius, influence_role, path_json, enabled, sort_order
    )
    values (
      #{id}, #{name}, #{nameEn}, #{kind}, #{basin}, #{currentSystem}, #{direction},
      #{source}, #{effect}, #{impactTagsJson}, #{textbookNote}, #{influenceLat},
      #{influenceLng}, #{influenceRadius}, #{influenceRole}, #{pathJson}, #{enabled}, #{sortOrder}
    )
    """)
  void insert(OceanCurrentEntity current);

  @Update("""
    update wl_ocean_current
    set name = #{name},
        name_en = #{nameEn},
        kind = #{kind},
        basin = #{basin},
        current_system = #{currentSystem},
        direction = #{direction},
        source = #{source},
        effect = #{effect},
        impact_tags_json = #{impactTagsJson},
        textbook_note = #{textbookNote},
        influence_lat = #{influenceLat},
        influence_lng = #{influenceLng},
        influence_radius = #{influenceRadius},
        influence_role = #{influenceRole},
        path_json = #{pathJson},
        enabled = #{enabled},
        sort_order = #{sortOrder},
        updated_at = current_timestamp
    where id = #{id}
    """)
  void update(OceanCurrentEntity current);

  @Update("""
    update wl_ocean_current
    set enabled = #{enabled},
        updated_at = current_timestamp
    where id = #{id}
    """)
  void updateEnabled(@Param("id") String id, @Param("enabled") boolean enabled);

  @Update("""
    update wl_ocean_current
    set sort_order = #{sortOrder},
        updated_at = current_timestamp
    where id = #{id}
    """)
  void updateSortOrder(@Param("id") String id, @Param("sortOrder") int sortOrder);

  @Delete("delete from wl_ocean_current where id = #{id}")
  void delete(@Param("id") String id);
}
