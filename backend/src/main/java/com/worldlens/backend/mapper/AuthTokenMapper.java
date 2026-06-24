package com.worldlens.backend.mapper;

import com.worldlens.backend.entity.UserEntity;
import java.time.LocalDateTime;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

public interface AuthTokenMapper {
  @Insert("""
    insert into wl_auth_token (token, user_id, expires_at)
    values (#{token}, #{userId}, #{expiresAt})
    """)
  void insert(@Param("token") String token, @Param("userId") Long userId, @Param("expiresAt") LocalDateTime expiresAt);

  @Select("""
    select u.id, u.username, u.password_hash, u.nickname, u.avatar_url, u.is_admin as admin, u.created_at, u.updated_at
    from wl_auth_token t
    join wl_user u on u.id = t.user_id
    where t.token = #{token}
      and t.expires_at > current_timestamp
    """)
  UserEntity findUserByToken(@Param("token") String token);

  @Delete("delete from wl_auth_token where token = #{token}")
  void delete(@Param("token") String token);

  @Delete("delete from wl_auth_token where user_id = #{userId}")
  void deleteByUserId(@Param("userId") Long userId);
}
