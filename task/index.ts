import tl = require('azure-pipelines-task-lib/task');
import fs = require('fs');

let versionFile : string;
let fullVersionFormat : string;
let prefixName : string;
let majorName : string;
let minorName : string; 
let patchName : string;
let suffixName : string;
let prefixOverride : string;
let majorOverride : string;
let minorOverride : string;
let patchOverride : string;
let suffixOverride : string;

enum VersionComponentName 
{
    Prefix = "Prefix",
    Major = "Major",
    Minor = "Minor",
    Patch = "Patch",
    Suffix = "Suffix"
}

enum InputName 
{
    File = "file",
    PrefixName = "prefixname",
    MajorName = "majorname",
    MinorName = "minorname",
    PatchName = "patchname",
    SuffixName = "suffixname",
    Format = "format"
}

enum OverrideVariableName 
{
    Prefix = "prefix",
    Major = "major",
    Minor = "minor",
    Patch = "patch",
    Suffix = "suffix"
}

enum OutputVariableName
{
    Prefix = "prefix",
    Major = "major",
    Minor = "minor",
    Patch = "patch",
    Suffix = "suffix",
    FullVersion = "version"
}

enum FormatToken 
{
    Prefix = "{prefix}",
    Major = "{major}",
    Minor = "{minor}",
    Patch = "{patch}",
    Suffix = "{suffix}",
    Delimiter = "."
}

class Version 
{
    Prefix: string;
    Major: string;
    Minor: string;
    Patch: string;
    Suffix: string;

    constructor(prefix: string, major: string, minor: string, patch: string, suffix: string)
    {
        this.Prefix = prefix;
        this.Major = major;
        this.Minor = minor;
        this.Patch = patch;
        this.Suffix = suffix;
    }
}

async function run() 
{
    try 
    {
        versionFile = tl.getPathInput(InputName.File, true, true);

        initializeFormat();
        initializeVersionNames();
        initializeVersionVariables();

        var content = fs.readFileSync(versionFile, 'utf8');

        var version = extractJson(content);

        if (version === null)
        {
            version = extractXml(content);

            if (version === null)
            {
                tl.setResult(tl.TaskResult.Failed, "Failed to parse the file.");
                return;
            }
        }

        ensureValidVersion(version);

        tl.setVariable(OutputVariableName.Prefix, "" + version.Prefix);
        tl.setVariable(OutputVariableName.Major, "" + version.Major);
        tl.setVariable(OutputVariableName.Minor, "" + version.Minor);
        tl.setVariable(OutputVariableName.Patch, "" + version.Patch);
        tl.setVariable(OutputVariableName.Suffix, "" + version.Suffix);
        tl.setVariable(OutputVariableName.FullVersion, "" + fullVersionFormat.replace(FormatToken.Prefix, version.Prefix)
                                                                             .replace(FormatToken.Major, version.Major)
                                                                             .replace(FormatToken.Minor, version.Minor)
                                                                             .replace(FormatToken.Patch, version.Patch)
                                                                             .replace(FormatToken.Suffix, version.Suffix));
    }
    catch (err) 
    {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

function initializeFormat()
{
    fullVersionFormat = tl.getInput(InputName.Format);
        
    if (!fullVersionFormat)
    {
        fullVersionFormat = FormatToken.Prefix + FormatToken.Major + FormatToken.Delimiter + FormatToken.Minor + FormatToken.Delimiter + FormatToken.Patch + FormatToken.Suffix;
    }
}

function initializeVersionNames()
{
    prefixName = tl.getInput(InputName.PrefixName, false);
    majorName = tl.getInput(InputName.MajorName, false);
    minorName = tl.getInput(InputName.MinorName, false);
    patchName = tl.getInput(InputName.PatchName, false);
    suffixName = tl.getInput(InputName.SuffixName, false);

    if (!prefixName)
    {
        prefixName = VersionComponentName.Prefix;
    }

    if (!majorName)
    {
        majorName = VersionComponentName.Major;
    }

    if (!minorName)
    {
        minorName = VersionComponentName.Minor;
    }

    if (!patchName)
    {
        patchName = VersionComponentName.Patch;
    }

    if (!suffixName)
    {
        suffixName = VersionComponentName.Suffix;
    }
}

function initializeVersionVariables()
{
    prefixOverride = tl.getVariable(OverrideVariableName.Prefix);
    majorOverride = tl.getVariable(OverrideVariableName.Major);
    minorOverride = tl.getVariable(OverrideVariableName.Minor);
    patchOverride = tl.getVariable(OverrideVariableName.Patch);
    suffixOverride = tl.getVariable(OverrideVariableName.Suffix);
}

function ensureValidVersion(version : Version)
{
    if (prefixOverride == '0' || prefixOverride)
    {
        version.Prefix = prefixOverride;
    }

    if (version.Prefix != '0' && !version.Prefix)
    {
        version.Prefix = '';
    }

    if (majorOverride == '0' || majorOverride)
    {
        version.Major = majorOverride;
    }

    if (version.Major != '0' && !version.Major)
    {
        version.Major = '';
    }

    if (minorOverride == '0' || minorOverride)
    {
        version.Minor = minorOverride;
    }

    if (version.Minor != '0' && !version.Minor)
    {
        version.Minor = '';
    }

    if (patchOverride == '0' || patchOverride)
    {
        version.Patch = patchOverride;
    }

    if (version.Patch != '0' && !version.Patch)
    {
        version.Patch = '';
    }

    if (suffixOverride == '0' || suffixOverride)
    {
        version.Suffix = suffixOverride;
    }

    if (version.Suffix != '0' && !version.Suffix)
    {
        version.Suffix = '';
    }
}

function extractJson(data : string) : Version | null
{
    try
    {
        // Replace all custom names with names we're expecting.
        data = data.replace(new RegExp(prefixName, 'g'), VersionComponentName.Prefix)
                   .replace(new RegExp(majorName, 'g'), VersionComponentName.Major)
                   .replace(new RegExp(minorName, 'g'), VersionComponentName.Minor)
                   .replace(new RegExp(patchName, 'g'), VersionComponentName.Patch)
                   .replace(new RegExp(suffixName, 'g'), VersionComponentName.Suffix);

        let version : Version = JSON.parse(data);

        if (version.Major != '0' && !version.Major ||
            version.Minor != '0' && !version.Minor ||
            version.Patch != '0' && !version.Patch)
        {
            console.log("JSON Parser: " + VersionComponentName.Major + "/" + VersionComponentName.Minor + "/" + VersionComponentName.Patch  + " are mandatory entries, failed to find them!");
            return null;
        }

        return version;
    }
    catch (error)
    {
        return null;
    }
}

function extractXml(data : string) : Version | null
{
    var majorEntry = extractEntryFromXml(data, majorName);
    var minorEntry = extractEntryFromXml(data, minorName);
    var patchEntry = extractEntryFromXml(data, patchName);

    if (majorEntry != '0' && !majorEntry ||
        minorEntry != '0' && !minorEntry ||
        patchEntry != '0' && !patchEntry)
    {
        console.log("XML Parser: " + VersionComponentName.Major + "/" + VersionComponentName.Minor + "/" + VersionComponentName.Patch  + " are mandatory entries, failed to find them!");
        return null;
    }

    var prefixEntry = extractEntryFromXml(data, prefixName);
    var suffixEntry = extractEntryFromXml(data, suffixName);

    return new Version(prefixEntry ? prefixEntry : '', majorEntry, minorEntry, patchEntry, suffixEntry ? suffixEntry : '');
}

function extractEntryFromXml(data : string, tag : string) : string | null
{
    var openingTag = "<" + tag + ">";
    var closingTag = "</" + tag + ">";

    var openingTagPos = data.indexOf(openingTag);
    var closingTagPos = data.indexOf(closingTag);

    if (openingTagPos == -1 || closingTagPos == -1)
    {
        return null;
    }

    var entry = data.substring(openingTagPos + openingTag.length, closingTagPos);

    return entry;
}

run();