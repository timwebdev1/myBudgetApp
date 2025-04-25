import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const TagManagement = ({ tag_id, onTagSelect }) => {
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#4ECDC4");
  const [error, setError] = useState("");
  const { user } = useAuth();

  const extractUniqueTags = (response) => {
    if (!response) return [];

    const tagsArray = Array.isArray(response) ? response : [response];
    const uniqueTags = new Map();

    tagsArray.forEach((tag) => {
      if (tag && tag.id && !uniqueTags.has(tag.id)) {
        uniqueTags.set(tag.id, {
          tag_id: tag.id,
          name: tag.name,
          color: tag.color || "#808080",
          isDefault: !!tag.default,
        });
      }
    });

    return Array.from(uniqueTags.values());
  };

  useEffect(() => {
    const fetchTags = async () => {
      if (!user?.userId) {
        console.log("No user found, skipping tag fetch");
        return;
      }

      try {
        console.log("Fetching tags for user:", user.userId);
        const response = await api.tagService.getUserTags(user.userId);
        console.log("Raw API response:", response);

        const processedTags = extractUniqueTags(response);
        console.log("Processed tags:", processedTags);

        if (processedTags.length > 0) {
          setTags(processedTags);
          setError("");
        } else {
          console.log("No tags found in response");
          setTags([]);
        }
      } catch (error) {
        console.error("Error fetching tags:", error);
        setError("Unable to load tags. Please try again.");
      }
    };

    fetchTags();
  }, [user]);

  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) {
      setError("Tag name is required");
      return;
    }

    const tagExists = tags.some(
      (tag) => tag.name.toLowerCase() === newTagName.trim().toLowerCase()
    );
    if (tagExists) {
      setError("A tag with this name already exists");
      return;
    }

    const tagData = {
      name: newTagName,
      color: newTagColor,
      isDefault: false,
    };


    try {
      console.log("Creating new tag:", tagData);
      const response = await api.tagService.createTag(tagData, user.userId);

      if (response && response.id) {
        const newTag = {
          tag_id: response.id,
          name: response.name,
          color: response.color,
          isDefault: response.default,
        };
        setTags((prevTags) => [...prevTags, newTag]);
        setNewTagName("");
        setNewTagColor("#4ECDC4");
        setError("");
      }
    } catch (error) {
      console.error("Error creating tag:", error);
      const errorMessage =
        error.response?.data || "Failed to create tag. Please try again.";
      setError(errorMessage);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Tags</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      {/* Enhanced dropdown with colored options */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">Select a Tag</h3>
        <select
          value={tag_id || ""}
          onChange={(e) => onTagSelect(e.target.value)}
          className="w-full p-2 border rounded-md bg-white focus:ring-2 focus:ring-blue-500"
          style={{
            lineHeight: "1.5",
            paddingLeft: "2rem",
          }}
        >
          <option value="">Choose a tag</option>
          {/* Default Tags Group */}
          <optgroup label="Default Tags">
            {tags
              .filter((tag) => tag.isDefault)
              .map((tag) => (
                <option
                  key={tag.tag_id}
                  value={tag.tag_id}
                  data-color={tag.color}
                  className="flex items-center"
                  style={{
                    paddingLeft: "2rem",
                    background: `linear-gradient(to right, ${tag.color} 1.5rem, transparent 1.5rem)`,
                  }}
                >
                  {tag.name}
                </option>
              ))}
          </optgroup>
          {/* Custom Tags Group */}
          <optgroup label="Custom Tags">
            {tags
              .filter((tag) => !tag.isDefault)
              .map((tag) => (
                <option
                  key={tag.tag_id}
                  value={tag.tag_id}
                  data-color={tag.color}
                  style={{
                    paddingLeft: "2rem",
                    background: `linear-gradient(to right, ${tag.color} 1.5rem, transparent 1.5rem)`,
                  }}
                >
                  {tag.name}
                </option>
              ))}
          </optgroup>
        </select>

        {/* Selected tag indicator */}
        {tag_id && (
          <div className="mt-2 flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-full"
              style={{
                backgroundColor: tags.find((t) => t.tag_id === Number(tag_id))
                  ?.color,
              }}
            />
            <span className="text-sm text-gray-600">
              Selected: {tags.find((t) => t.tag_id === Number(tag_id))?.name}
            </span>
          </div>
        )}

      </div>

      {/* Create new tag section */}
      <div className="space-y-4">
        <h3 className="font-medium">Create New Tag</h3>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Tag name"

            className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
            maxLength="50"
          />
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={newTagColor}
              onChange={(e) => setNewTagColor(e.target.value)}
              className="w-12 h-10 p-1 border rounded cursor-pointer"
              title="Choose tag color"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Add Tag
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagManagement;