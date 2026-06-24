package com.worldlens.backend.mapper;

import com.worldlens.backend.entity.ContentEntryEntity;
import java.util.List;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

public interface ContentEntryMapper {
  @Select("select count(*) from wl_content_entry")
  int countAll();

  @Select("select count(*) from wl_content_entry where content_module = #{module}")
  int countByModule(@Param("module") String module);

  @Select("""
    select *
    from wl_content_entry
    where content_module = #{module}
      and (#{includeDisabled} = true or enabled = true)
      and (
        #{keyword} is null
        or lower(entry_id) like concat('%', lower(#{keyword}), '%')
        or lower(title) like concat('%', lower(#{keyword}), '%')
        or lower(subtitle) like concat('%', lower(#{keyword}), '%')
        or lower(summary) like concat('%', lower(#{keyword}), '%')
      )
    order by sort_order asc, title asc
    """)
  List<ContentEntryEntity> findByModule(
      @Param("module") String module,
      @Param("keyword") String keyword,
      @Param("includeDisabled") boolean includeDisabled
  );

  @Select("""
    select count(*)
    from wl_content_entry
    where content_module = #{module}
      and (#{includeDisabled} = true or enabled = true)
      and (
        #{keyword} is null
        or lower(entry_id) like concat('%', lower(#{keyword}), '%')
        or lower(title) like concat('%', lower(#{keyword}), '%')
        or lower(subtitle) like concat('%', lower(#{keyword}), '%')
        or lower(summary) like concat('%', lower(#{keyword}), '%')
      )
    """)
  long countByModuleFiltered(
      @Param("module") String module,
      @Param("keyword") String keyword,
      @Param("includeDisabled") boolean includeDisabled
  );

  @Select("""
    select *
    from wl_content_entry
    where content_module = #{module}
      and (#{includeDisabled} = true or enabled = true)
      and (
        #{keyword} is null
        or lower(entry_id) like concat('%', lower(#{keyword}), '%')
        or lower(title) like concat('%', lower(#{keyword}), '%')
        or lower(subtitle) like concat('%', lower(#{keyword}), '%')
        or lower(summary) like concat('%', lower(#{keyword}), '%')
      )
    order by sort_order asc, title asc
    limit #{limit} offset #{offset}
    """)
  List<ContentEntryEntity> findByModulePage(
      @Param("module") String module,
      @Param("keyword") String keyword,
      @Param("includeDisabled") boolean includeDisabled,
      @Param("limit") int limit,
      @Param("offset") int offset
  );

  @Select("select * from wl_content_entry where content_module = #{module} and entry_id = #{entryId}")
  ContentEntryEntity findByModuleAndEntryId(@Param("module") String module, @Param("entryId") String entryId);

  @Insert("""
    insert into wl_content_entry (
      content_module, entry_id, title, subtitle, summary, payload_json, enabled, sort_order
    )
    values (
      #{contentModule}, #{entryId}, #{title}, #{subtitle}, #{summary}, #{payloadJson}, #{enabled}, #{sortOrder}
    )
    """)
  void insert(ContentEntryEntity entry);

  @Update("""
    update wl_content_entry
    set title = #{title},
        subtitle = #{subtitle},
        summary = #{summary},
        payload_json = #{payloadJson},
        enabled = #{enabled},
        sort_order = #{sortOrder},
        updated_at = current_timestamp
    where content_module = #{contentModule} and entry_id = #{entryId}
    """)
  void update(ContentEntryEntity entry);

  @Update("""
    update wl_content_entry
    set enabled = #{enabled},
        updated_at = current_timestamp
    where content_module = #{module} and entry_id = #{entryId}
    """)
  void updateEnabled(@Param("module") String module, @Param("entryId") String entryId, @Param("enabled") boolean enabled);

  @Delete("delete from wl_content_entry where content_module = #{module} and entry_id = #{entryId}")
  void delete(@Param("module") String module, @Param("entryId") String entryId);
}
