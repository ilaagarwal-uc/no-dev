OUTPUT_PATH = '/tmp/26197275-6e8a-4aa9-8e2f-eb15e08e90d9.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the structural skeleton of the wall based on the provided image dimensions.
    Wall Dimensions: 14'6" (Width) x 9' (Height)
    Opening Dimensions: 7' (Width) x 8' (Height) located at the bottom-left.
    """
    # Clear existing objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Conversion factor from feet to meters
    FT_TO_M = 0.3048

    # --- Dimensions Analysis ---
    # Total width = 7' (opening width) + 7'6" (remaining wall width) = 14.5 feet
    # Total height = 9 feet
    # Opening height = 8 feet (leaving a 1 foot gap at the top as indicated)
    
    wall_width_m = 14.5 * FT_TO_M
    wall_height_m = 9.0 * FT_TO_M
    wall_depth_m = 0.15  # Standard structural wall thickness (~6 inches)

    opening_width_m = 7.0 * FT_TO_M
    opening_height_m = 8.0 * FT_TO_M

    # --- 1. Create the Main Wall ---
    # Create a cube and transform it to represent the full wall boundary
    bpy.ops.mesh.primitive_cube_add(size=1)
    wall = bpy.context.active_object
    wall.name = "Main_Wall_Boundary"
    
    # Set scale (Blender cube size 1 means dimensions are 1x1x1)
    wall.scale = (wall_width_m, wall_depth_m, wall_height_m)
    # Position so the bottom-left-front corner is at the origin (0,0,0)
    wall.location = (wall_width_m / 2, 0, wall_height_m / 2)
    
    # Apply transformations
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # --- 2. Create the Opening Cutter ---
    # This represents the door/window area to be removed from the skeleton
    bpy.ops.mesh.primitive_cube_add(size=1)
    cutter = bpy.context.active_object
    cutter.name = "Wall_Opening"
    
    # Scale the cutter (slightly thicker than the wall to ensure a clean boolean cut)
    cutter.scale = (opening_width_m, wall_depth_m * 1.1, opening_height_m)
    # Position at the bottom left
    cutter.location = (opening_width_m / 2, 0, opening_height_m / 2)
    
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # --- 3. Perform Boolean Operation ---
    # Subtract the opening from the main wall
    bool_mod = wall.modifiers.new(name="Opening_Subtraction", type='BOOLEAN')
    bool_mod.object = cutter
    bool_mod.operation = 'DIFFERENCE'
    
    # Apply the modifier
    bpy.context.view_layer.objects.active = wall
    bpy.ops.object.modifier_apply(modifier=bool_mod.name)

    # Remove the cutter object from the scene
    bpy.data.objects.remove(cutter, do_unlink=True)

    # --- 4. Export to GLB ---
    # Exporting the entire scene (which now only contains the wall skeleton)
    bpy.ops.export_scene.gltf(
        filepath='/tmp/26197275-6e8a-4aa9-8e2f-eb15e08e90d9.glb', 
        export_format='GLB', 
        use_selection=False
    )

# Execute the reconstruction
create_wall_skeleton()