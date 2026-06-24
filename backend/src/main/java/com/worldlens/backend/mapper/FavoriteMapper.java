package com.worldlens.backend.mapper;

import com.worldlens.backend.entity.FavoriteEntity;
import java.util.List;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

public interface FavoriteMapper {
  @Select("select * from wl_favorite where user_id = #{userId} order by created_at desc")
  List<FavoriteEntity> findByUserId(@Param("userId") Long userId);

  @Select("select * from wl_favorite where user_id = #{userId} and item_id = #{itemId}")
  FavoriteEntity findOne(@Param("userId") Long userId, @Param("itemId") String itemId);

  @Insert("""
    insert into wl_favorite (user_id, item_id, item_type, title, cover_image, payload)
    values (#{userId}, #{itemId}, #{itemType}, #{title}, #{coverImage}, #{payload})
    """)
  void insert(FavoriteEntity favorite);

  @Update("""
    update wl_favorite
    set item_type = #{itemType},
        title = #{title},
        cover_image = #{coverImage},
        payload = #{payload},
        updated_at = current_timestamp
    where user_id = #{userId}
      and item_id = #{itemId}
    """)
  void update(FavoriteEntity favorite);

  @Delete("delete from wl_favorite where user_id = #{userId} and item_id = #{itemId}")
  void deleteOne(@Param("userId") Long userId, @Param("itemId") String itemId);

  @Delete("delete from wl_favorite where user_id = #{userId}")
  void deleteAll(@Param("userId") Long userId);
}
