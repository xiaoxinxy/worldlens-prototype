package com.worldlens.backend.mapper;

import com.worldlens.backend.entity.UserEntity;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

public interface UserMapper {
  @Select("select count(*) from wl_user")
  int count();

  @Select("select count(*) from wl_user where is_admin = true")
  int countAdmins();

  @Select("""
    select id, username, password_hash, nickname, avatar_url, is_admin as admin, created_at, updated_at
    from wl_user
    where id = #{id}
    """)
  UserEntity findById(@Param("id") Long id);

  @Select("""
    select id, username, password_hash, nickname, avatar_url, is_admin as admin, created_at, updated_at
    from wl_user
    where username = #{username}
    """)
  UserEntity findByUsername(@Param("username") String username);

  @Insert("""
    insert into wl_user (username, password_hash, nickname, avatar_url, is_admin)
    values (#{username}, #{passwordHash}, #{nickname}, #{avatarUrl}, #{admin})
    """)
  @Options(useGeneratedKeys = true, keyProperty = "id")
  void insert(UserEntity user);

  @Update("""
    update wl_user
    set nickname = #{nickname},
        avatar_url = #{avatarUrl},
        updated_at = current_timestamp
    where id = #{id}
    """)
  void updateProfile(UserEntity user);
}
