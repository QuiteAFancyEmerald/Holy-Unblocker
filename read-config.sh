# Isolated for Windows compatibility since jq only returns strings, and not booleans.
test -z "$1" && exit 1 || (
  option="$(jq -r "$1" "./src/config.json")";
# Return a boolean if it's true or false.
  if test "$option" = "true" -o "$option" = "false";
  then $option;
# Otherwise, return a string.
  else echo "$option";
  fi;
)
