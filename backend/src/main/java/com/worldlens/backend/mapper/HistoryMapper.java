package com.worldlens.backend.mapper;

import com.worldlens.backend.entity.HistoryEntity;
import com.worldlens.backend.entity.HistoryTypeStat;
import java.util.List;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

public interface HistoryMapper {
  @Select("select * from wl_history where user_id = #{userId} order by last_visited_at desc")
  List<HistoryEntity> findByUserId(@Param("userId") Long userId);

  @Select("select * from wl_history where user_id = #{userId} order by last_visited_at desc limit #{limit}")
  List<HistoryEntity> findRecent(@Param("userId") Long userId, @Param("limit") int limit);

  @Select("select * from wl_history where user_id = #{userId} and item_id = #{itemId}")
  HistoryEntity findOne(@Param("userId") Long userId, @Param("itemId") String itemId);

  @Select("select count(*) from wl_history where user_id = #{userId}")
  int countByUserId(@Param("userId") Long userId);

  @Select("""
    select item_type, count(*) as count
    from wl_history
    where user_id = #{userId}
    group by item_type
    order by count desc, item_type asc
    """)
  List<HistoryTypeStat> countByType(@Param("userId") Long userId);

  @Insert("""
    insert into wl_history (user_id, item_id, item_type, title, slug, cover_image)
    values (#{userId}, #{itemId}, #{itemType}, #{title}, #{slug}, #{coverImage})
    """)
  void insert(HistoryEntity history);

  @Update("""
    update wl_history
    set item_type = #{itemType},
        title = #{title},
        slug = #{slug},
        cover_image = #{coverImage},
        visited_count = visited_count + 1,
        last_visited_at = current_timestamp,
        updated_at = current_timestamp
    where user_id = #{userId}
      and item_id = #{itemId}
    """)
  void updateVisit(HistoryEntity history);

  @Delete("delete from wl_history where user_id = #{userId} and item_id = #{itemId}")
  void deleteOne(@Param("userId") Long userId, @Param("itemId") String itemId);

  @Delete("delete from wl_history where user_id = #{userId}")
  void deleteAll(@Param("userId") Long userId);
}
