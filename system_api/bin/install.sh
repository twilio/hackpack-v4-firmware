
# Install package dependencies

# The --prefix triggers an NPM install without leaving whatever current folder
# structure is

echo ""
echo "Installing SYSTEMAPI dependencies"
echo ""

npm --prefix /home/pi/firmware/system_api install --silent
