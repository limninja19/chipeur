import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export function useProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()
      .then(({ data, error }) => {
        if (!error && data) setProfile(data);
        setLoading(false);
      });
  }, [userId]);

  const updateProfile = async (updates) => {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();
    if (!error && data) setProfile(data);
    return { data, error };
  };

  return { profile, loading, updateProfile };
}
